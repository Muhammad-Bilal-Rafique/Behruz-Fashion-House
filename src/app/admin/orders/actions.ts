"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/connect";
import Order from "@/models/Order";
import Product from "@/models/Product";

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Verify customer advance payment (PKR 1,000) and confirm the order.
 */
export async function verifyAdvancePaymentAction(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
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

    order.payment.status = "verified";
    order.payment.advancePaymentStatus = "verified";
    order.payment.verifiedAt = new Date();
    order.orderStatus = "confirmed";
    await order.save();

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
 * Does NOT confirm the order.
 */
export async function rejectAdvancePaymentAction(
  orderId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
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
 * If transitioning to "cancelled" from non-cancelled, safely restores stock to sizeStock.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
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

    // Restock if cancelling
    if (newStatus === "cancelled" && previousStatus !== "cancelled") {
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

    order.orderStatus = newStatus as any;
    await order.save();

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
 * Business rule: Order can only be deleted if status is "delivered" OR payment is "rejected".
 */
export async function deleteOrderAction(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
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

    await Order.findByIdAndDelete(order._id);

    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error: any) {
    console.error("deleteOrderAction error:", error);
    return { success: false, error: error.message || "Failed to delete order." };
  }
}
