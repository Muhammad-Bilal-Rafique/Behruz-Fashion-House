import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/connect";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order reference is required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Query either by MongoDB ObjectId or by human-readable orderNumber (e.g. BFH-2609-1234)
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

    return NextResponse.json({
      success: true,
      order: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        customer: order.customer,
        items: order.items,
        pricing: order.pricing,
        shipping: order.shipping,
        payment: order.payment,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load order details." },
      { status: 500 }
    );
  }
}
