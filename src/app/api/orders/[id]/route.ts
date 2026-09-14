import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/connect";
import Order from "@/models/Order";
import { getCurrentAdminSession } from "@/app/admin/login/actions";

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

    // Query either by MongoDB ObjectId or human-readable orderNumber
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

    // Access authorization check
    const adminSession = await getCurrentAdminSession();
    const tokenQuery = request.nextUrl.searchParams.get("token")?.trim();
    const phoneQuery = request.nextUrl.searchParams.get("phone")?.replace(/\D/g, "");

    const isAdmin = Boolean(adminSession && adminSession.authenticated);
    const hasValidToken = Boolean(
      tokenQuery &&
      order.customerAccessToken &&
      tokenQuery === order.customerAccessToken
    );

    const orderPhoneDigits = (order.customer?.phone || "").replace(/\D/g, "");
    const hasMatchingPhone = Boolean(
      phoneQuery &&
      phoneQuery.length >= 7 &&
      orderPhoneDigits.endsWith(phoneQuery)
    );

    if (!isAdmin && !hasValidToken && !hasMatchingPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Order details can only be viewed with a valid access token or phone verification.",
        },
        { status: 401 }
      );
    }

    // If verified via phone only (not admin and not token), mask street address for customer privacy
    const isMaskedView = !isAdmin && !hasValidToken && hasMatchingPhone;
    const sanitizedCustomer = isMaskedView
      ? {
          name: order.customer.name,
          phone: order.customer.phone ? `${order.customer.phone.slice(0, 4)}****${order.customer.phone.slice(-3)}` : "",
          email: "",
          country: order.customer.country,
          province: order.customer.province,
          city: order.customer.city,
          address: "*** Filtered for Customer Privacy ***",
        }
      : order.customer;

    return NextResponse.json({
      success: true,
      order: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        customer: sanitizedCustomer,
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
