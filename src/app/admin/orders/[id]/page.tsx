import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  ShieldCheck,
  XCircle,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  User,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import connectDB from "@/lib/connect";
import Order from "@/models/Order";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { OrderDetailActions } from "@/components/admin/orders/order-detail-actions";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order #${id} | Admin | Behruz Fashion House`,
    description: "View and manage order details, items, delivery, and payment verification.",
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  await connectDB();

  let rawOrder: any = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    rawOrder = await Order.findById(id).lean();
  }
  if (!rawOrder) {
    rawOrder = await Order.findOne({ orderNumber: id }).lean();
  }

  if (!rawOrder) {
    notFound();
  }

  const orderNumber = rawOrder.orderNumber || String(rawOrder._id).slice(-8).toUpperCase();
  const customerName = rawOrder.customer?.name || "Customer";
  const customerPhone = rawOrder.customer?.phone || "";
  const customerEmail = rawOrder.customer?.email || "";
  const advanceAmount = rawOrder.pricing?.advanceAmount || rawOrder.payment?.advanceAmount || 1000;
  const paymentStatus = rawOrder.payment?.status || "pending";
  const orderStatus = rawOrder.orderStatus || "awaiting_advance";
  const items = Array.isArray(rawOrder.items) ? rawOrder.items : [];

  const formattedDate = new Date(rawOrder.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = new Date(rawOrder.createdAt).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Status Badge Helper
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "awaiting_advance":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Awaiting Advance Payment
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-300">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            Processing
          </span>
        );
      case "dispatched":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-300">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            Dispatched
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-50 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-xs uppercase font-semibold px-3 py-1 rounded-full bg-muted border border-border">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Advance Payment Verified
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Advance Payment Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Advance Payment Awaiting Verification
          </span>
        );
    }
  };

  const remainingBalance = Math.max(0, (rawOrder.pricing?.total || 0) - advanceAmount);

  return (
    <div className="min-h-screen bg-muted/20 pb-20 selection:bg-primary/20 selection:text-primary">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-6">
        {/* Top Back Navigation Link */}
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Order Header Card */}
        <div className="bg-card border border-border rounded-xs p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary font-medium mb-1">
                <span>ORDER DETAILS</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
                Order #{orderNumber}
              </h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate} at {formattedTime}
                </span>
                <span>•</span>
                <span className="font-mono text-[11px]">ID: {String(rawOrder._id)}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:self-start">
              {getOrderStatusBadge(orderStatus)}
              {getPaymentStatusBadge(paymentStatus)}
            </div>
          </div>

          {/* Interactive Actions Row */}
          <OrderDetailActions
            orderId={String(rawOrder._id)}
            orderNumber={orderNumber}
            customerName={customerName}
            customerPhone={customerPhone}
            advanceAmount={advanceAmount}
            paymentStatus={paymentStatus}
            orderStatus={orderStatus}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Order Items & Financials */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Card */}
            <Card className="rounded-xs border-border shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span>Order Items ({items.length})</span>
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    Historical purchase prices preserved
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/60">
                {items.map((item: any, idx: number) => (
                  <div
                    key={`${item.productId || idx}-${idx}`}
                    className="p-4 sm:p-5 flex items-start gap-4 hover:bg-muted/10 transition-colors"
                  >
                    {/* Item Image */}
                    <div className="relative w-16 h-20 rounded-xs overflow-hidden bg-muted shrink-0 border border-border">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-serif text-sm sm:text-base font-normal text-foreground truncate">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-muted border border-border font-mono">
                          Size: <strong className="text-foreground">{item.size}</strong>
                        </span>
                        <span>Quantity: <strong className="text-foreground">{item.quantity}</strong></span>
                        <span>•</span>
                        <span>Unit: <strong className="text-foreground">PKR {Number(item.price || 0).toLocaleString()}</strong></span>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                        Item Total
                      </span>
                      <span className="font-sans text-sm sm:text-base font-bold text-foreground tabular-nums">
                        PKR {Number(item.itemTotal || (item.price * item.quantity) || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pricing Summary Card */}
            <Card className="rounded-xs border-border shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-semibold">Pricing Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-3 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-sans font-medium text-foreground tabular-nums">
                    PKR {(rawOrder.pricing?.subtotal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Fee ({rawOrder.pricing?.shippingType?.replace(/_/g, " ") || "Standard"}):</span>
                  <span className="font-sans font-medium text-foreground tabular-nums">
                    PKR {(rawOrder.pricing?.shippingFee || 0).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between text-sm font-bold">
                  <span className="text-foreground">Total Order Amount:</span>
                  <span className="font-sans text-foreground tabular-nums">
                    PKR {(rawOrder.pricing?.total || 0).toLocaleString()}
                  </span>
                </div>

                {/* Advance Payment Split */}
                <div className="pt-2 border-t border-border/60 space-y-2 bg-muted/30 p-3 rounded-xs">
                  <div className="flex justify-between text-xs">
                    <span className="text-primary font-semibold">Advance Required:</span>
                    <span className="font-sans font-bold text-primary tabular-nums">
                      PKR {advanceAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Remaining COD at Delivery:</span>
                    <span className="font-sans font-semibold text-foreground tabular-nums">
                      PKR {remainingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right 1 Column: Customer, Delivery & Payment */}
          <div className="space-y-6">
            {/* Customer Information Card */}
            <Card className="rounded-xs border-border shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Full Name
                  </span>
                  <span className="font-semibold text-foreground text-sm block">
                    {customerName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Phone Number
                  </span>
                  <span className="font-mono text-foreground font-medium block">
                    {customerPhone || "Not provided"}
                  </span>
                </div>

                {customerEmail && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      Email Address
                    </span>
                    <span className="text-foreground block truncate">
                      {customerEmail}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Address Card */}
            <Card className="rounded-xs border-border shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Shipping Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Street Address
                  </span>
                  <p className="text-foreground font-medium leading-relaxed">
                    {rawOrder.customer?.address || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      City
                    </span>
                    <span className="text-foreground font-medium">
                      {rawOrder.customer?.city || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      Province
                    </span>
                    <span className="text-foreground font-medium">
                      {rawOrder.customer?.province || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex justify-between items-center">
                  <span className="text-muted-foreground">Delivery Estimate:</span>
                  <span className="font-medium text-foreground">
                    {rawOrder.shipping?.deliveryEstimate || "3–5 business days"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment & Advance Status Card */}
            <Card className="rounded-xs border-border shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>Payment & Advance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                    {rawOrder.payment?.method?.replace(/_/g, " ") || "Cash on Delivery"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Advance Required:</span>
                  <span className="font-sans font-bold text-foreground">
                    PKR {advanceAmount.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                    Advance Status
                  </span>
                  {paymentStatus === "verified" ? (
                    <div className="p-2.5 rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Advance payment verified</span>
                      </div>
                      {rawOrder.payment?.verifiedAt && (
                        <span className="text-[11px] text-emerald-700 block">
                          Verified on {new Date(rawOrder.payment.verifiedAt).toLocaleDateString("en-PK")}
                        </span>
                      )}
                    </div>
                  ) : paymentStatus === "rejected" ? (
                    <div className="p-2.5 rounded-xs bg-red-50 border border-red-200 text-red-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Advance payment rejected</span>
                      </div>
                      {rawOrder.payment?.rejectionReason && (
                        <p className="text-[11px] text-red-700 italic">
                          "{rawOrder.payment.rejectionReason}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xs bg-amber-50 border border-amber-200 text-amber-800 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Advance payment awaiting verification</span>
                      </div>
                      <p className="text-[11px] text-amber-700">
                        Check customer screenshot on WhatsApp, then click "Verify Advance".
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
