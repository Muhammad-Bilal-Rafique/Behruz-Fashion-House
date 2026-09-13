import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connect";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const query: Record<string, any> = {};

    // Filter by orderStatus
    if (status && status !== "all") {
      query.orderStatus = status;
    }

    // Search by orderNumber, customer name, phone, or email
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { orderNumber: searchRegex },
        { "customer.name": searchRegex },
        { "customer.phone": searchRegex },
        { "customer.email": searchRegex },
        { "customer.city": searchRegex },
      ];
    }

    // Fetch matching orders
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    // Compute status counts for admin badge counters
    const [
      totalCount,
      awaitingAdvanceCount,
      confirmedCount,
      processingCount,
      dispatchedCount,
      deliveredCount,
      cancelledCount,
    ] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ orderStatus: "awaiting_advance" }),
      Order.countDocuments({ orderStatus: "confirmed" }),
      Order.countDocuments({ orderStatus: "processing" }),
      Order.countDocuments({ orderStatus: "dispatched" }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.countDocuments({ orderStatus: "cancelled" }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      counts: {
        all: totalCount,
        awaiting_advance: awaitingAdvanceCount,
        confirmed: confirmedCount,
        processing: processingCount,
        dispatched: dispatchedCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch admin orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load orders." },
      { status: 500 }
    );
  }
}
