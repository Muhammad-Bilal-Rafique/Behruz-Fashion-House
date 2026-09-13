import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  PackagePlus,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  ShieldCheck,
  XCircle,
  ArrowRight,
  Globe,
  Plus,
  Sparkles,
  ExternalLink,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { Button } from "@/components/ui/button";
import {
  getOrderStatusBadge,
  getPaymentStatusBadge,
} from "@/components/admin/orders/order-badges";

export const metadata: Metadata = {
  title: "Dashboard | Admin | Behruz Fashion House",
  description: "Overview of your store, products, orders and revenue.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectDB();

  // Parallelized MongoDB queries for optimum performance
  const [
    totalProducts,
    activeProducts,
    draftProducts,
    featuredProducts,
    totalOrders,
    awaitingAdvanceCount,
    confirmedCount,
    processingCount,
    dispatchedCount,
    deliveredCount,
    cancelledCount,
    confirmedRevenueAgg,
    shippingDistributionAgg,
    recentOrdersDocs,
    awaitingAdvanceDocs,
    recentProductsDocs,
  ] = await Promise.all([
    // 1. Product Counts
    Product.countDocuments({}),
    Product.countDocuments({ status: "active" }),
    Product.countDocuments({ status: "draft" }),
    Product.countDocuments({ isFeatured: true }),

    // 2. Order Status Counts
    Order.countDocuments({}),
    Order.countDocuments({
      $or: [
        { orderStatus: "awaiting_advance" },
        { "payment.status": "pending" },
      ],
    }),
    Order.countDocuments({ orderStatus: "confirmed" }),
    Order.countDocuments({ orderStatus: "processing" }),
    Order.countDocuments({ orderStatus: "dispatched" }),
    Order.countDocuments({ orderStatus: "delivered" }),
    Order.countDocuments({ orderStatus: "cancelled" }),

    // 3. Confirmed Order Value Aggregation
    // Business rule: Confirmed + Processing + Dispatched + Delivered.
    // Excludes cancelled and pending advance orders.
    Order.aggregate([
      {
        $match: {
          orderStatus: {
            $in: ["confirmed", "processing", "dispatched", "delivered"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricing.total" },
          totalAdvance: { $sum: "$pricing.advanceAmount" },
          count: { $sum: 1 },
        },
      },
    ]),

    // 4. Shipping Regional Distribution
    Order.aggregate([
      {
        $project: {
          country: {
            $toLower: {
              $trim: {
                input: {
                  $ifNull: [
                    "$shipping.country",
                    { $ifNull: ["$customer.country", ""] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $in: ["$country", ["pakistan", "pk", "pak"]] },
              "pakistan",
              "international",
            ],
          },
          count: { $sum: 1 },
        },
      },
    ]),

    // 5. Recent 5 Orders
    Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // 6. Awaiting Advance Queue (up to 5)
    Order.find({
      $or: [
        { orderStatus: "awaiting_advance" },
        { "payment.status": "pending" },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // 7. Recent 5 Products
    Product.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  // Extract revenue metrics
  const confirmedOrderValue =
    confirmedRevenueAgg.length > 0 ? confirmedRevenueAgg[0].totalRevenue : 0;
  const confirmedOrdersCount =
    confirmedRevenueAgg.length > 0 ? confirmedRevenueAgg[0].count : 0;

  // Extract shipping metrics
  let pakistanOrdersCount = 0;
  let internationalOrdersCount = 0;
  for (const item of shippingDistributionAgg) {
    if (item._id === "pakistan") {
      pakistanOrdersCount = item.count;
    } else {
      internationalOrdersCount += item.count;
    }
  }

  // Server formatted timestamp
  const currentTime = new Date();
  const formattedLastUpdated = currentTime.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Admin Top Navigation */}
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-8">
        {/* ======================================================== */}
        {/* 1. PAGE HEADER                                           */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary font-medium mb-1.5">
              <span>STORE MANAGEMENT</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of your store, products and orders.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-xs self-start sm:self-auto shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>
              Last updated:{" "}
              <strong className="text-foreground font-medium">
                {formattedLastUpdated}
              </strong>
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. ACTIONABLE ALERT (If Awaiting Advance > 0)             */}
        {/* ======================================================== */}
        {awaitingAdvanceCount > 0 && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in-50">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 border border-amber-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-amber-900">
                  {awaitingAdvanceCount}{" "}
                  {awaitingAdvanceCount === 1 ? "payment" : "payments"} awaiting
                  verification
                </h2>
                <p className="text-[11px] sm:text-xs text-amber-800/90 mt-0.5">
                  Customers have placed orders with a PKR 1,000 advance. Review
                  their payment proofs to confirm.
                </p>
              </div>
            </div>

            <Link href="/admin/orders" className="shrink-0">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3.5 rounded-xs shadow-xs font-semibold gap-1.5 cursor-pointer"
              >
                <span>Review Pending Payments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. TOP SUMMARY CARDS (6 CARDS GRID)                      */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Card 1: Total Products */}
          <Link
            href="/admin/products"
            className="group p-4 rounded-xs border border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider group-hover:text-primary transition-colors">
                Products
              </span>
              <Package className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-foreground block tabular-nums">
                {totalProducts}
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Total products
              </span>
            </div>
          </Link>

          {/* Card 2: Active Products */}
          <Link
            href="/admin/products?status=active"
            className="group p-4 rounded-xs border border-emerald-200/80 bg-emerald-50/40 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider">
                Active
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-emerald-950 block tabular-nums">
                {activeProducts}
              </span>
              <span className="text-[11px] text-emerald-700 block mt-0.5">
                Currently visible
              </span>
            </div>
          </Link>

          {/* Card 3: Draft Products */}
          <Link
            href="/admin/products?status=draft"
            className="group p-4 rounded-xs border border-amber-200/80 bg-amber-50/40 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider">
                Draft
              </span>
              <PackagePlus className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-3">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-amber-950 block tabular-nums">
                {draftProducts}
              </span>
              <span className="text-[11px] text-amber-700 block mt-0.5">
                Not visible publicly
              </span>
            </div>
          </Link>

          {/* Card 4: Total Orders */}
          <Link
            href="/admin/orders"
            className="group p-4 rounded-xs border border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider group-hover:text-primary transition-colors">
                Orders
              </span>
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-foreground block tabular-nums">
                {totalOrders}
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                All customer orders
              </span>
            </div>
          </Link>

          {/* Card 5: Awaiting Advance */}
          <Link
            href="/admin/orders"
            className={`group p-4 rounded-xs border shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${
              awaitingAdvanceCount > 0
                ? "border-amber-300 bg-amber-50/70 hover:border-amber-400"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div
              className={`flex items-center justify-between ${
                awaitingAdvanceCount > 0
                  ? "text-amber-800 font-bold"
                  : "text-muted-foreground"
              }`}
            >
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider">
                Awaiting Advance
              </span>
              <Clock
                className={`w-4 h-4 ${
                  awaitingAdvanceCount > 0
                    ? "text-amber-600"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="mt-3">
              <span
                className={`font-sans text-2xl sm:text-3xl font-bold block tabular-nums ${
                  awaitingAdvanceCount > 0
                    ? "text-amber-950"
                    : "text-foreground"
                }`}
              >
                {awaitingAdvanceCount}
              </span>
              <span
                className={`text-[11px] block mt-0.5 ${
                  awaitingAdvanceCount > 0
                    ? "text-amber-700 font-medium"
                    : "text-muted-foreground"
                }`}
              >
                Need verification
              </span>
            </div>
          </Link>

          {/* Card 6: Confirmed Orders */}
          <Link
            href="/admin/orders"
            className="group p-4 rounded-xs border border-blue-200/80 bg-blue-50/40 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-blue-800">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider">
                Confirmed
              </span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-3">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-blue-950 block tabular-nums">
                {confirmedCount}
              </span>
              <span className="text-[11px] text-blue-700 block mt-0.5">
                Confirmed orders
              </span>
            </div>
          </Link>
        </div>

        {/* ======================================================== */}
        {/* 4. REVENUE & ORDER STATUS OVERVIEW                       */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Confirmed Order Value Card */}
          <div className="p-5 rounded-xs border border-border bg-card shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
                  Confirmed Order Value
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {confirmedOrdersCount} orders
                </span>
              </div>
              <div className="mt-2.5">
                <span className="font-sans text-3xl sm:text-4xl font-bold text-foreground block tabular-nums tracking-tight">
                  PKR {confirmedOrderValue.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/60">
              Calculated from confirmed, processing, dispatched and delivered
              orders. Excludes cancelled and pending advance orders.
            </p>
          </div>

          {/* Lifecycle Status Distribution */}
          <div className="lg:col-span-2 p-5 rounded-xs border border-border bg-card shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs uppercase font-bold tracking-wider text-foreground">
                  Order Status Breakdown
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Live counts across all stages of fulfillment
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Manage Orders</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              <div className="p-3 rounded-xs border border-emerald-200/80 bg-emerald-50/40 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Confirmed
                </span>
                <span className="font-sans text-xl font-bold text-emerald-950 block mt-1 tabular-nums">
                  {confirmedCount}
                </span>
              </div>

              <div className="p-3 rounded-xs border border-blue-200/80 bg-blue-50/40 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-800 block">
                  Processing
                </span>
                <span className="font-sans text-xl font-bold text-blue-950 block mt-1 tabular-nums">
                  {processingCount}
                </span>
              </div>

              <div className="p-3 rounded-xs border border-purple-200/80 bg-purple-50/40 text-center">
                <span className="text-[10px] uppercase font-bold text-purple-800 block">
                  Dispatched
                </span>
                <span className="font-sans text-xl font-bold text-purple-950 block mt-1 tabular-nums">
                  {dispatchedCount}
                </span>
              </div>

              <div className="p-3 rounded-xs border border-slate-200 bg-slate-50 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-800 block">
                  Delivered
                </span>
                <span className="font-sans text-xl font-bold text-slate-950 block mt-1 tabular-nums">
                  {deliveredCount}
                </span>
              </div>

              <div className="p-3 rounded-xs border border-red-200/80 bg-red-50/40 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-red-800 block">
                  Cancelled
                </span>
                <span className="font-sans text-xl font-bold text-red-950 block mt-1 tabular-nums">
                  {cancelledCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. RECENT ORDERS & AWAITING ADVANCE (2-COLUMNS)          */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Recent Orders (2 Columns) */}
          <div className="lg:col-span-2 border border-border rounded-xs bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h2 className="font-serif text-lg font-normal text-foreground">
                  Recent Orders
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Latest customer orders placed on your storefront
                </p>
              </div>

              <Link href="/admin/orders">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-3 rounded-xs gap-1.5 hover:border-primary cursor-pointer"
                >
                  <span>View All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {recentOrdersDocs.length > 0 ? (
              <div className="space-y-2.5">
                {recentOrdersDocs.map((order: any) => {
                  const orderDate = new Date(
                    order.createdAt
                  ).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <Link
                      key={order._id.toString()}
                      href={`/admin/orders/${order._id.toString()}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xs border border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30 transition-all text-xs"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-foreground group-hover:text-primary transition-colors block">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            {order.customer?.name || "Customer"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span className="font-sans font-bold text-foreground tabular-nums text-xs">
                          PKR {(order.pricing?.total || 0).toLocaleString()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {getPaymentStatusBadge(order.payment?.status)}
                          {getOrderStatusBadge(order.orderStatus)}
                        </div>

                        <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden md:inline">
                          {orderDate}
                        </span>

                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-sm font-normal text-foreground">
                  No orders yet
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Customer orders will appear here once they are placed.
                </p>
              </div>
            )}
          </div>

          {/* Awaiting Advance Payment Queue (1 Column) */}
          <div className="border border-border rounded-xs bg-card p-5 space-y-4 shadow-2xs">
            <div className="border-b border-border/60 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-normal text-foreground flex items-center gap-2">
                  <span>Awaiting Advance</span>
                  {awaitingAdvanceCount > 0 && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                      {awaitingAdvanceCount}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Orders requiring verification
                </p>
              </div>
            </div>

            {awaitingAdvanceDocs.length > 0 ? (
              <div className="space-y-3">
                {awaitingAdvanceDocs.map((order: any) => {
                  const orderDate = new Date(
                    order.createdAt
                  ).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                  });
                  const advance =
                    order.pricing?.advanceAmount ||
                    order.payment?.advanceAmount ||
                    1000;

                  return (
                    <div
                      key={order._id.toString()}
                      className="p-3.5 rounded-xs border border-amber-200/80 bg-amber-50/30 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/admin/orders/${order._id.toString()}`}
                          className="font-mono font-bold text-foreground hover:text-primary transition-colors"
                        >
                          #{order.orderNumber}
                        </Link>
                        <span className="text-[10px] text-muted-foreground">
                          {orderDate}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between text-[11px]">
                        <span className="font-semibold text-foreground truncate max-w-[140px]">
                          {order.customer?.name}
                        </span>
                        <span className="font-sans font-bold text-amber-900 tabular-nums">
                          PKR {advance.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {order.customer?.phone}
                        </span>
                        <Link href={`/admin/orders/${order._id.toString()}`}>
                          <Button
                            size="sm"
                            className="h-6 px-2.5 text-[10px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xs cursor-pointer gap-1"
                          >
                            <span>Review</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {awaitingAdvanceCount > 5 && (
                  <div className="text-center pt-1">
                    <Link
                      href="/admin/orders"
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      + View all {awaitingAdvanceCount} pending payments
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-sm font-normal text-foreground">
                  No payments awaiting verification
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  All customer advance payments have been reviewed and verified.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6. RECENT PRODUCTS & SHIPPING OVERVIEW                   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Recent Products (2 Columns) */}
          <div className="lg:col-span-2 border border-border rounded-xs bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h2 className="font-serif text-lg font-normal text-foreground">
                  Recent Products
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Latest garments added to your catalog
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/admin/add-product">
                  <Button
                    size="sm"
                    className="text-xs h-8 px-3 rounded-xs gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add Product</span>
                  </Button>
                </Link>

                <Link href="/admin/products">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3 rounded-xs gap-1.5 hover:border-primary cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {recentProductsDocs.length > 0 ? (
              <div className="space-y-2.5">
                {recentProductsDocs.map((product: any) => {
                  const coverImage =
                    product.images?.find((img: any) => img.isCover)?.url ||
                    product.images?.[0]?.url ||
                    null;
                  const addedDate = new Date(
                    product.createdAt
                  ).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <Link
                      key={product._id.toString()}
                      href={`/admin/products/${product._id.toString()}/edit`}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xs border border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Thumbnail */}
                        <div className="relative w-12 h-14 rounded-xs overflow-hidden bg-muted shrink-0 border border-border/80">
                          {coverImage ? (
                            <Image
                              src={coverImage}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <span className="font-serif text-sm font-normal text-foreground group-hover:text-primary transition-colors block truncate max-w-xs sm:max-w-md">
                            {product.name}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span>{addedDate}</span>
                            {product.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase text-primary">
                                <Sparkles className="w-2.5 h-2.5" />
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-sans font-bold text-foreground tabular-nums block text-xs">
                            PKR{" "}
                            {(
                              product.discountedPrice ||
                              product.originalPrice ||
                              0
                            ).toLocaleString()}
                          </span>
                          {product.discountedPrice &&
                            product.discountedPrice < product.originalPrice && (
                              <span className="text-[10px] text-muted-foreground line-through block tabular-nums">
                                PKR {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            product.status === "active"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {product.status === "active" ? "Active" : "Draft"}
                        </span>

                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Package className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-normal text-foreground">
                    No products yet
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Add your first product to start displaying items in your
                    shop.
                  </p>
                </div>
                <Link href="/admin/add-product" className="inline-block">
                  <Button size="sm" className="text-xs h-8 px-4 rounded-xs gap-1.5 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Regional Shipping Overview & Store Highlights (1 Column) */}
          <div className="border border-border rounded-xs bg-card p-5 space-y-5 shadow-2xs">
            <div className="border-b border-border/60 pb-3">
              <h2 className="font-serif text-lg font-normal text-foreground">
                Shipping Overview
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Regional order distribution
              </p>
            </div>

            <div className="space-y-3">
              {/* Pakistan Orders */}
              <div className="p-3.5 rounded-xs border border-border/80 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    PK
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Pakistan Orders
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      COD + Advance
                    </span>
                  </div>
                </div>
                <span className="font-sans text-lg font-bold text-foreground tabular-nums">
                  {pakistanOrdersCount}
                </span>
              </div>

              {/* International Orders */}
              <div className="p-3.5 rounded-xs border border-border/80 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold border border-border">
                    INT
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      International Orders
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Weight-based dispatch
                    </span>
                  </div>
                </div>
                <span className="font-sans text-lg font-bold text-foreground tabular-nums">
                  {internationalOrdersCount}
                </span>
              </div>
            </div>

            {/* Catalog Highlights Note */}
            <div className="p-3.5 rounded-xs border border-border/60 bg-card space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-muted-foreground">
                  Featured Products
                </span>
                <span className="font-sans font-bold text-primary tabular-nums">
                  {featuredProducts}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Featured items receive top placement across hero highlights and
                storefront showcases.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 7. QUICK ACTIONS                                         */}
        {/* ======================================================== */}
        <div className="border border-border rounded-xs bg-card p-5 space-y-3 shadow-2xs">
          <div>
            <h2 className="font-serif text-lg font-normal text-foreground">
              Quick Actions
            </h2>
            <p className="text-xs text-muted-foreground">
              Fast shortcuts for daily store operations
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <Link href="/admin/add-product">
              <Button
                variant="outline"
                className="w-full h-11 text-xs font-medium border-border hover:border-primary/50 hover:bg-primary/5 text-foreground rounded-xs justify-start gap-2.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-primary" />
                <span>Add Product</span>
              </Button>
            </Link>

            <Link href="/admin/products">
              <Button
                variant="outline"
                className="w-full h-11 text-xs font-medium border-border hover:border-primary/50 hover:bg-primary/5 text-foreground rounded-xs justify-start gap-2.5 cursor-pointer"
              >
                <Package className="w-4 h-4 text-primary" />
                <span>Manage Products</span>
              </Button>
            </Link>

            <Link href="/admin/orders">
              <Button
                variant="outline"
                className="w-full h-11 text-xs font-medium border-border hover:border-primary/50 hover:bg-primary/5 text-foreground rounded-xs justify-start gap-2.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span>Manage Orders</span>
              </Button>
            </Link>

            <Link href="/admin/edit-website">
              <Button
                variant="outline"
                className="w-full h-11 text-xs font-medium border-border hover:border-primary/50 hover:bg-primary/5 text-foreground rounded-xs justify-start gap-2.5 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-primary" />
                <span>Edit Website</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
