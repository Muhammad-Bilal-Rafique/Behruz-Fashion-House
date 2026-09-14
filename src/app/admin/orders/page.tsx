import { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import connectDB from "@/lib/connect";
import Order from "@/models/Order";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { Button } from "@/components/ui/button";
import { OrderSearchFilter } from "@/components/admin/orders/order-search-filter";
import { OrderTableRow, OrderMobileCard, SerializedOrder } from "@/components/admin/orders/order-table-row";
import { OrderPagination } from "@/components/admin/orders/order-pagination";

export const metadata: Metadata = {
  title: "Orders Management | Admin | Behruz Fashion House",
  description: "Manage customer orders, payments and delivery status.",
};

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const search = (resolvedParams.search || "").trim();
  const statusFilter = resolvedParams.status || "all";
  const paymentStatusFilter = resolvedParams.paymentStatus || "all";

  let dbError: string | null = null;
  let totalOrdersCount = 0;
  let awaitingAdvanceCount = 0;
  let confirmedCount = 0;
  let dispatchedCount = 0;
  let deliveredCount = 0;
  let matchingCount = 0;
  let orders: SerializedOrder[] = [];

  try {
    await connectDB();

    // 1. Fetch live metrics across entire database in parallel
    const [total, awaiting, confirmed, dispatched, delivered] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({
        $or: [{ orderStatus: "awaiting_advance" }, { "payment.status": "pending" }],
      }),
      Order.countDocuments({ orderStatus: "confirmed" }),
      Order.countDocuments({ orderStatus: "dispatched" }),
      Order.countDocuments({ orderStatus: "delivered" }),
    ]);

    totalOrdersCount = total;
    awaitingAdvanceCount = awaiting;
    confirmedCount = confirmed;
    dispatchedCount = dispatched;
    deliveredCount = delivered;

    // 2. Build filtered MongoDB query with $and composition
    const andClauses: any[] = [];

    if (statusFilter && statusFilter !== "all") {
      andClauses.push({ orderStatus: statusFilter });
    }

    if (paymentStatusFilter && paymentStatusFilter !== "all") {
      andClauses.push({
        $or: [
          { "payment.status": paymentStatusFilter },
          { "payment.advancePaymentStatus": paymentStatusFilter },
        ],
      });
    }

    if (search) {
      const escaped = escapeRegex(search);
      const searchRegex = { $regex: escaped, $options: "i" };
      andClauses.push({
        $or: [
          { orderNumber: searchRegex },
          { "customer.name": searchRegex },
          { "customer.phone": searchRegex },
          { "customer.email": searchRegex },
          { "customer.city": searchRegex },
        ],
      });
    }

    const query = andClauses.length > 0 ? { $and: andClauses } : {};

    // 3. Count matching documents for pagination
    matchingCount = await Order.countDocuments(query);

    // 4. Fetch paginated orders slice sorted newest first
    const rawOrders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .lean();

    // 5. Safely serialize for Client Component props
    orders = rawOrders.map((doc: any) => ({
      _id: String(doc._id),
      orderNumber: doc.orderNumber || String(doc._id).slice(-8).toUpperCase(),
      customer: {
        name: doc.customer?.name || "Customer",
        phone: doc.customer?.phone || "N/A",
        email: doc.customer?.email || "",
        country: doc.customer?.country || "Pakistan",
        province: doc.customer?.province || "",
        city: doc.customer?.city || "",
        address: doc.customer?.address || "",
      },
      items: Array.isArray(doc.items)
        ? doc.items.map((item: any) => ({
            productId: String(item.productId || ""),
            name: item.name || "Product",
            image: item.image || "",
            size: item.size || "Standard",
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0),
            itemTotal: Number(item.itemTotal || item.price || 0),
          }))
        : [],
      pricing: {
        subtotal: Number(doc.pricing?.subtotal || 0),
        shippingFee: Number(doc.pricing?.shippingFee || 0),
        shippingType: doc.pricing?.shippingType || "punjab",
        total: Number(doc.pricing?.total || 0),
        advanceAmount: Number(doc.pricing?.advanceAmount || doc.payment?.advanceAmount || 1000),
        remainingAmount: Number(doc.pricing?.remainingAmount || 0),
      },
      shipping: {
        country: doc.shipping?.country || "Pakistan",
        province: doc.shipping?.province || "",
        deliveryEstimate: doc.shipping?.deliveryEstimate || "3–5 business days",
        status: doc.shipping?.status || "pending",
      },
      payment: {
        method: doc.payment?.method || "cash_on_delivery",
        status: doc.payment?.status || "pending",
        advanceAmount: Number(doc.payment?.advanceAmount || doc.pricing?.advanceAmount || 1000),
        advancePaymentStatus: doc.payment?.advancePaymentStatus || doc.payment?.status || "pending",
        verifiedAt: doc.payment?.verifiedAt ? new Date(doc.payment.verifiedAt).toISOString() : undefined,
        rejectedAt: doc.payment?.rejectedAt ? new Date(doc.payment.rejectedAt).toISOString() : undefined,
        rejectionReason: doc.payment?.rejectionReason || "",
      },
      orderStatus: doc.orderStatus || "awaiting_advance",
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err: any) {
    console.error("Error fetching orders in /admin/orders:", err);
    dbError = err.message || "Failed to establish database connection.";
  }

  const totalPages = Math.ceil(matchingCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-muted/20 pb-20 selection:bg-primary/20 selection:text-primary">
      {/* Top Admin Navbar */}
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary font-medium mb-1">
              <span>ADMIN PORTAL</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
              Orders
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Manage customer orders, payments and delivery status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/orders">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs h-9 border-border hover:border-primary/40 rounded-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Database Connection Error Notice */}
        {dbError && (
          <div className="p-4 rounded-xs border border-red-200 bg-red-50 text-red-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to connect to database</p>
              <p className="mt-0.5 text-red-700">{dbError}</p>
            </div>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Awaiting Advance (Highest priority metric) */}
          <div className="col-span-2 sm:col-span-1 p-4 rounded-xs border-2 border-amber-400 bg-amber-50/50 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                Awaiting Advance
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="font-sans text-2xl sm:text-3xl font-bold text-amber-900 block tabular-nums">
              {awaitingAdvanceCount}
            </span>
            <span className="text-[11px] text-amber-700 block">
              Pending PKR 1,000 proof
            </span>
          </div>

          {/* Confirmed Orders */}
          <div className="p-4 rounded-xs border border-border bg-card shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Confirmed
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-sans text-2xl sm:text-3xl font-bold text-foreground block tabular-nums">
              {confirmedCount}
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Advance verified
            </span>
          </div>

          {/* Dispatched */}
          <div className="p-4 rounded-xs border border-border bg-card shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Dispatched
              </span>
              <Truck className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-sans text-2xl sm:text-3xl font-bold text-foreground block tabular-nums">
              {dispatchedCount}
            </span>
            <span className="text-[11px] text-muted-foreground block">
              En route with courier
            </span>
          </div>

          {/* Delivered */}
          <div className="p-4 rounded-xs border border-border bg-card shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Delivered
              </span>
              <ShieldCheck className="w-4 h-4 text-slate-600" />
            </div>
            <span className="font-sans text-2xl sm:text-3xl font-bold text-foreground block tabular-nums">
              {deliveredCount}
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Completed deliveries
            </span>
          </div>

          {/* Total Orders */}
          <div className="p-4 rounded-xs border border-border bg-card shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Total Orders
              </span>
              <Package className="w-4 h-4 text-primary" />
            </div>
            <span className="font-sans text-2xl sm:text-3xl font-bold text-foreground block tabular-nums">
              {totalOrdersCount}
            </span>
            <span className="text-[11px] text-muted-foreground block">
              All lifetime orders
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <OrderSearchFilter
          currentSearch={search}
          currentStatus={statusFilter}
          currentPaymentStatus={paymentStatusFilter}
        />

        {/* Orders Table Container */}
        <div className="space-y-3">
          {orders.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block border border-border rounded-xs bg-card shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs divide-y divide-border">
                  <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Advance</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {orders.map((order) => (
                      <OrderTableRow key={order._id} order={order} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards */}
              <div className="md:hidden space-y-3">
                {orders.map((order) => (
                  <OrderMobileCard key={order._id} order={order} />
                ))}
              </div>
            </>
          ) : totalOrdersCount === 0 && !search && statusFilter === "all" && paymentStatusFilter === "all" ? (
            /* Global Empty State */
            <div className="py-20 text-center space-y-3 px-4 border border-border rounded-xs bg-card">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Package className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-serif text-lg font-normal text-foreground">
                  No orders yet
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Customer orders will appear here once they are placed.
                </p>
              </div>
            </div>
          ) : (
            /* Filtered Search Empty State */
            <div className="py-16 text-center space-y-3 px-4 border border-border rounded-xs bg-card">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-serif text-base font-normal text-foreground">
                  No orders found
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Try changing your search or filter criteria.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm" className="text-xs h-8 rounded-xs cursor-pointer">
                    Clear Filters
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <OrderPagination
            currentPage={page}
            totalPages={totalPages}
            totalOrders={matchingCount}
            limit={ITEMS_PER_PAGE}
          />
        </div>
      </main>
    </div>
  );
}
