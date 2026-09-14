import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
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

export const dynamic = "force-dynamic";

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

// GET single order details for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session || !session.authenticated) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order reference is required." },
        { status: 400 }
      );
    }

    await connectDB();

    let order: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id }).lean();
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Admin error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order details." },
      { status: 500 }
    );
  }
}

// PATCH: Verify advance payment, reject payment, or update order/shipping status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session || !session.authenticated) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order reference is required." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, status: newStatus, reason } = body;

    await connectDB();

    const order = mongoose.Types.ObjectId.isValid(id)
      ? await Order.findById(id)
      : await Order.findOne({ orderNumber: id });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    // 1. ACTION: Verify Advance Payment
    if (action === "verify_payment") {
      const wasConfirmed = order.orderStatus === "confirmed";

      order.payment.status = "verified";
      order.payment.advancePaymentStatus = "verified";
      order.payment.verifiedAt = new Date();
      order.orderStatus = "confirmed";
      await order.save();

      if (!wasConfirmed && order.customer?.email) {
        sendOrderConfirmedEmail(formatEmailData(order)).catch((err) =>
          console.error("Email error:", err)
        );
      }

      try {
        revalidatePath("/admin/orders");
        revalidatePath(`/admin/orders/${id}`);
      } catch (revalErr) {
        console.error("Path revalidation error:", revalErr);
      }

      return NextResponse.json({
        success: true,
        message: "Advance payment verified and order confirmed successfully.",
        order,
      });
    }

    // 2. ACTION: Reject Payment
    if (action === "reject_payment") {
      order.payment.status = "rejected";
      order.payment.advancePaymentStatus = "rejected";
      order.payment.rejectedAt = new Date();
      if (reason) {
        order.payment.rejectionReason = String(reason).trim();
      }
      await order.save();

      try {
        revalidatePath("/admin/orders");
        revalidatePath(`/admin/orders/${id}`);
      } catch (revalErr) {
        console.error("Path revalidation error:", revalErr);
      }

      return NextResponse.json({
        success: true,
        message: "Payment marked as rejected.",
        order,
      });
    }

    // 3. ACTION: Update Order Status (processing, dispatched, delivered, cancelled)
    if (action === "update_status" && newStatus) {
      const validStatuses = [
        "awaiting_advance",
        "confirmed",
        "processing",
        "dispatched",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(newStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid order status "${newStatus}".` },
          { status: 400 }
        );
      }

      const previousStatus = order.orderStatus;

      // Restock ONLY if moving to cancelled and NOT already restocked
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
        // Re-deduct if moving out of cancelled
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
            console.error(`Failed to re-deduct product ${item.productId}:`, deductErr);
          }
        }
        order.isStockRestocked = false;
      }

      order.orderStatus = newStatus;
      await order.save();

      // Trigger status update emails
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

      try {
        revalidatePath("/admin/orders");
        revalidatePath(`/admin/orders/${id}`);
      } catch (revalErr) {
        console.error("Path revalidation error:", revalErr);
      }

      return NextResponse.json({
        success: true,
        message: `Order status updated to ${newStatus}.`,
        order,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or parameters." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order." },
      { status: 500 }
    );
  }
}

// DELETE: Delete an order if status is delivered or payment is rejected
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session || !session.authenticated) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order reference is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const order = mongoose.Types.ObjectId.isValid(id)
      ? await Order.findById(id)
      : await Order.findOne({ orderNumber: id });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    const isDelivered = order.orderStatus === "delivered";
    const isCancelled = order.orderStatus === "cancelled";
    const isPaymentRejected =
      order.payment?.status === "rejected" ||
      order.payment?.advancePaymentStatus === "rejected" ||
      (order.orderStatus as string) === "rejected";

    if (!isDelivered && !isPaymentRejected && !isCancelled) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Orders can only be deleted if they are Canceled, Rejected, or Delivered.",
        },
        { status: 400 }
      );
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

    try {
      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${id}`);
    } catch (revalErr) {
      console.error("Path revalidation error:", revalErr);
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (error: any) {
    console.error("Admin order delete error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete order." },
      { status: 500 }
    );
  }
}
