"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/connect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getCurrentAdminSession } from "@/app/admin/login/actions";
import {
  sendOrderConfirmedEmail,
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from "@/lib/email";

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function formatEmailData(order: any) {
  return {
    orderNumber: order.orderNumber,
    customer: {
      name: order.customer.name,
      phone: order.customer.phone,
      email: order.customer.email,
      country: order.customer.country,
      province: order.customer.province,
      city: order.customer.city,
      address: order.customer.address,
    },
    pricing: {
      subtotal: order.pricing.subtotal,
      shippingFee: order.pricing.shippingFee,
      shippingType: order.pricing.shippingType,
      total: order.pricing.total,
      advanceAmount: order.pricing.advanceAmount,
      remainingAmount: order.pricing.remainingAmount,
    },
    shipping: {
      deliveryEstimate: order.shipping?.deliveryEstimate,
    },
    items: (order.items || []).map((it: any) => ({
      name: it.name,
      size: it.size,
      quantity: it.quantity,
      price: it.price,
      itemTotal: it.itemTotal,
    })),
  };
}

/**
 * Verify customer advance payment (PKR 1,000) and confirm the order.
 */
export async function verifyAdvancePaymentAction(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentAdminSession();
    if (!session || !session.authenticated) {
      return { success: false, error: "Unauthorized. Admin session required." };
    }

    if (!orderId) {
      return { success: false, error: "Order ID is required." };
    }

    await connectDB();
    const order = isValidObjectId(orderId)
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    const wasConfirmed = order.orderStatus === "confirmed";

    order.payment.status = "verified";
    order.payment.advancePaymentStatus = "verified";
    order.payment.verifiedAt = new Date();
    order.orderStatus = "confirmed";
    await order.save();

    if (!wasConfirmed && order.customer?.email) {
      sendOrderConfirmedEmail(formatEmailData(order)).catch((err) =>
        console.error("Failed to send order confirmed email:", err)
      );
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true };
  } catch (error: any) {
    console.error("verifyAdvancePaymentAction error:", error);
    return { success: false, error: error.message || "Failed to verify payment." };
  }
}

/**
 * Reject customer advance payment with an optional explanation reason.
 */
export async function rejectAdvancePaymentAction(
  orderId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentAdminSession();
    if (!session || !session.authenticated) {
      return { success: false, error: "Unauthorized. Admin session required." };
    }

    if (!orderId) {
      return { success: false, error: "Order ID is required." };
    }

    await connectDB();
    const order = isValidObjectId(orderId)
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    order.payment.status = "rejected";
    order.payment.advancePaymentStatus = "rejected";
    order.payment.rejectedAt = new Date();
    if (reason) {
      order.payment.rejectionReason = String(reason).trim();
    }
    await order.save();

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true };
  } catch (error: any) {
    console.error("rejectAdvancePaymentAction error:", error);
    return { success: false, error: error.message || "Failed to reject payment." };
  }
}

/**
 * Update order lifecycle status (processing, dispatched, delivered, cancelled).
 * Safely manages stock restoration to avoid double restocking.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentAdminSession();
    if (!session || !session.authenticated) {
      return { success: false, error: "Unauthorized. Admin session required." };
    }

    if (!orderId || !newStatus) {
      return { success: false, error: "Order ID and status are required." };
    }

    const validStatuses = [
      "awaiting_advance",
      "confirmed",
      "processing",
      "dispatched",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: `Invalid order status "${newStatus}".` };
    }

    await connectDB();
    const order = isValidObjectId(orderId)
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    const previousStatus = order.orderStatus;

    // Restock ONLY if transitioning to cancelled and NOT already restocked
    if (newStatus === "cancelled" && !order.isStockRestocked) {
      for (const item of order.items) {
        try {
          await Product.updateOne(
            {
              _id: item.productId,
              "sizeStock.size": item.size,
            },
            {
              $inc: { "sizeStock.$.stock": item.quantity },
            }
          );
        } catch (restockErr) {
          console.error(`Failed to restock product ${item.productId}:`, restockErr);
        }
      }
      order.isStockRestocked = true;
    } else if (previousStatus === "cancelled" && newStatus !== "cancelled" && order.isStockRestocked) {
      // Transitioning out of cancelled: re-deduct stock
      for (const item of order.items) {
        try {
          await Product.updateOne(
            {
              _id: item.productId,
              "sizeStock.size": item.size,
            },
            {
              $inc: { "sizeStock.$.stock": -item.quantity },
            }
          );
        } catch (deductErr) {
          console.error(`Failed to re-deduct stock for product ${item.productId}:`, deductErr);
        }
      }
      order.isStockRestocked = false;
    }

    order.orderStatus = newStatus as any;
    await order.save();

    // Trigger customer notification emails
    if (order.customer?.email) {
      const emailData = formatEmailData(order);
      if (newStatus === "confirmed" && previousStatus !== "confirmed") {
        sendOrderConfirmedEmail(emailData).catch((err) => console.error("Email err:", err));
      } else if (newStatus === "dispatched" && previousStatus !== "dispatched") {
        sendOrderDispatchedEmail(emailData).catch((err) => console.error("Email err:", err));
      } else if (newStatus === "delivered" && previousStatus !== "delivered") {
        sendOrderDeliveredEmail(emailData).catch((err) => console.error("Email err:", err));
      } else if (newStatus === "cancelled" && previousStatus !== "cancelled") {
        sendOrderCancelledEmail(emailData).catch((err) => console.error("Email err:", err));
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true };
  } catch (error: any) {
    console.error("updateOrderStatusAction error:", error);
    return { success: false, error: error.message || "Failed to update order status." };
  }
}

/**
 * Delete an order document from MongoDB.
 * Ensures stock is restocked if the order was not fulfilled and not previously restocked.
 */
export async function deleteOrderAction(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentAdminSession();
    if (!session || !session.authenticated) {
      return { success: false, error: "Unauthorized. Admin session required." };
    }

    if (!orderId) {
      return { success: false, error: "Order ID is required." };
    }

    await connectDB();
    const order = isValidObjectId(orderId)
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber: orderId });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    const isDelivered = order.orderStatus === "delivered";
    const isCancelled = order.orderStatus === "cancelled";
    const isPaymentRejected =
      order.payment?.status === "rejected" ||
      order.payment?.advancePaymentStatus === "rejected" ||
      (order.orderStatus as string) === "rejected";

    if (!isDelivered && !isPaymentRejected && !isCancelled) {
      return {
        success: false,
        error:
          "Orders can only be deleted if they are Canceled, Rejected, or Delivered.",
      };
    }

    // If deleting an unfulfilled order that was never restocked, restore stock now
    if (!isDelivered && !order.isStockRestocked) {
      for (const item of order.items) {
        try {
          await Product.updateOne(
            {
              _id: item.productId,
              "sizeStock.size": item.size,
            },
            {
              $inc: { "sizeStock.$.stock": item.quantity },
            }
          );
        } catch (restockErr) {
          console.error(`Failed to restock product ${item.productId}:`, restockErr);
        }
      }
    }

    await Order.findByIdAndDelete(order._id);

    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error: any) {
    console.error("deleteOrderAction error:", error);
    return { success: false, error: error.message || "Failed to delete order." };
  }
}
