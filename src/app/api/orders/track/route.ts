import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connect";
import Order from "@/models/Order";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "track_ip";
    const rateLimit = checkRateLimit(`track_${clientIp}`, 15, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many tracking lookups. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const orderNumber = String(body.orderNumber || "").trim().toUpperCase();
    const phone = String(body.phone || "").replace(/\D/g, "");

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Please enter your Order Reference Number (e.g. BFH-2609-XXXX)." },
        { status: 400 }
      );
    }

    if (!phone || phone.length < 7) {
      return NextResponse.json(
        { success: false, error: "Please enter the phone number associated with the order." },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({ orderNumber }).lean();
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "No order found matching this Order Number and Phone. Please verify your details.",
        },
        { status: 404 }
      );
    }

    const orderPhoneDigits = (order.customer?.phone || "").replace(/\D/g, "");
    if (!orderPhoneDigits.endsWith(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "The phone number does not match our records for this order.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        city: order.customer.city,
        province: order.customer.province,
        orderStatus: order.orderStatus,
        paymentStatus: order.payment?.status || "pending",
        advancePaymentStatus: order.payment?.advancePaymentStatus || "pending",
        advanceAmount: order.pricing.advanceAmount,
        totalAmount: order.pricing.total,
        remainingAmount: order.pricing.remainingAmount,
        deliveryEstimate: order.shipping.deliveryEstimate || "3–5 business days",
        createdAt: order.createdAt,
        items: (order.items || []).map((it: any) => ({
          name: it.name,
          size: it.size,
          quantity: it.quantity,
          image: it.image,
        })),
      },
    });
  } catch (error: any) {
    console.error("Order tracking API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track order. Please try again later." },
      { status: 500 }
    );
  }
}
