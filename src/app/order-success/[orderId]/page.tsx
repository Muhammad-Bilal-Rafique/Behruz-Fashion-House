"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import {
  useStoreSettings,
  generateWhatsAppProofUrl,
} from "@/components/providers/store-settings-provider";
import { WhatsAppIcon } from "@/components/shared/social-icons";
import {
  Clock,
  Copy,
  Check,
  Building2,
  Smartphone,
  MapPin,
  Truck,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface OrderDetail {
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    country: string;
    province: string;
    city: string;
    address: string;
  };
  pricing: {
    subtotal: number;
    shippingFee: number;
    shippingType: string;
    total: number;
    advanceAmount: number;
    remainingAmount: number;
  };
  shipping: {
    country: string;
    province: string;
    deliveryEstimate: string;
    status: string;
  };
  payment: {
    method: string;
    status: string;
    advanceAmount: number;
    advancePaymentStatus: string;
  };
  orderStatus: string;
  items: {
    productId: string;
    name: string;
    image: string;
    size: string;
    quantity: number;
    price: number;
    itemTotal: number;
  }[];
  createdAt: string;
}

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const settings = useStoreSettings();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get("token");
        const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";

        const res = await fetch(`/api/orders/${orderId}${tokenQuery}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Order not found.");
          return;
        }

        setOrder(data.order);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Network issue while loading your order. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Loading Order Details...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-normal">Order Not Found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error || "We could not find the order details for this reference."}
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-widest font-semibold bg-[#FF3154] text-white rounded-xs shadow-xs hover:bg-[#FF3154]/90"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const whatsappUrl = generateWhatsAppProofUrl(
    order.orderNumber,
    order.customer.name,
    settings
  );

  const isVerified = order.payment.status === "verified";
  const isRejected = order.payment.status === "rejected";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-8 w-full">
        <div className="space-y-4 sm:space-y-6">
          {/* ======================================================== */}
          {/* 1. COMPACT TOP STATUS BAR (NO CELEBRATION HERO / TICK)   */}
          {/* ======================================================== */}
          <div className="p-2.5 sm:p-3.5 rounded-xs bg-muted/40 border border-border flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="text-muted-foreground hidden xs:inline">Order Reference:</span>
              <span className="font-mono font-bold text-foreground truncate text-[11px] sm:text-xs">
                #{order.orderNumber}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider hidden sm:inline">
                Order Status:
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase px-2 sm:px-2.5 py-0.5 rounded-full border ${
                  isVerified
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isRejected
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>
                  {isVerified
                    ? "Confirmed"
                    : isRejected
                    ? "Payment Rejected"
                    : "Awaiting Advance Payment"}
                </span>
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. PROMINENT ACTION REQUIRED SECTION (ABOVE THE FOLD)    */}
          {/* ======================================================== */}
          <div className="border-2 border-primary bg-primary/[0.02] p-4 sm:p-7 rounded-xs shadow-xs space-y-4 sm:space-y-5">
            <div className="text-center space-y-1.5">
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold bg-[#FF3154] text-white">
                Order Received — Advance Payment Required
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-foreground">
                PKR {order.pricing.advanceAmount.toLocaleString()} Advance Payment Required
              </h1>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Your order has been received successfully. A{" "}
                <strong className="text-foreground">
                  PKR {order.pricing.advanceAmount.toLocaleString()}
                </strong>{" "}
                advance payment is required to confirm your order.
              </p>
            </div>

            {/* Financial Breakdown Pill */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 bg-background border border-border rounded-xs text-center text-xs">
              <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-border/70 pb-2.5 sm:pb-0">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Advance Amount
                </span>
                <span className="font-sans text-sm sm:text-base font-bold text-primary tabular-nums">
                  PKR {order.pricing.advanceAmount.toLocaleString()}
                </span>
              </div>
              <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-border/70 pb-2.5 sm:pb-0">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Payment Status
                </span>
                <span
                  className={`inline-block font-sans text-xs sm:text-sm font-bold uppercase ${
                    isVerified
                      ? "text-emerald-600"
                      : isRejected
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
                >
                  {isVerified
                    ? "Verified"
                    : isRejected
                    ? "Rejected"
                    : "Pending Verification"}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Order Status
                </span>
                <span className="font-sans text-xs sm:text-sm font-bold text-foreground uppercase">
                  {order.orderStatus === "confirmed"
                    ? "Confirmed"
                    : order.orderStatus === "cancelled"
                    ? "Cancelled"
                    : "Awaiting Advance Payment"}
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 3. VERIFIED CLIENT PAYMENT ACCOUNTS (FULL WIDTH, NO CUT) */}
            {/* ======================================================== */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-widest font-bold text-foreground">
                  Official Payment Accounts
                </h2>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Behruz Fashion House
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method 1: Mobile Wallets (EasyPaisa / JazzCash) */}
                <div className="p-4 sm:p-5 rounded-xs border border-border bg-card shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          EasyPaisa / JazzCash
                        </h3>
                        <span className="text-[10px] text-muted-foreground">
                          Mobile Account
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs pt-1 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">
                        Account Title:
                      </span>
                      <span className="font-semibold text-foreground">
                        {settings.walletAccountName}
                      </span>
                    </div>

                    {/* Mobile Number Box */}
                    <div className="p-2.5 rounded-xs bg-muted/40 border border-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Mobile Account Number
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(settings.walletAccountNumber, "wallet_number")
                          }
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-background border border-border rounded-xs hover:border-primary text-foreground transition-colors cursor-pointer"
                        >
                          {copiedKey === "wallet_number" ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-muted-foreground" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <span className="font-mono font-bold text-xs sm:text-sm text-foreground block select-all break-all tracking-wider">
                        {settings.walletDisplayNumber || settings.walletAccountNumber}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    {settings.paymentInstructions || `Send PKR ${order.pricing.advanceAmount.toLocaleString()} via mobile account.`}
                  </p>
                </div>

                {/* Method 2: Bank Transfer */}
                <div className="p-4 sm:p-5 rounded-xs border border-border bg-card shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Bank Transfer
                        </h3>
                        <span className="text-[10px] text-muted-foreground">
                          {settings.bankName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs pt-1 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">
                        Account Title:
                      </span>
                      <span className="font-semibold text-foreground">
                        {settings.bankAccountName}
                      </span>
                    </div>

                    {/* Account Number Box */}
                    <div className="p-2.5 rounded-xs bg-muted/40 border border-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Account Number
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(settings.bankAccountNumber, "bank_acc")
                          }
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-background border border-border rounded-xs hover:border-primary text-foreground transition-colors cursor-pointer"
                        >
                          {copiedKey === "bank_acc" ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-muted-foreground" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <span className="font-mono font-bold text-xs sm:text-sm text-foreground block select-all break-all tracking-wider">
                        {settings.bankAccountNumber}
                      </span>
                    </div>

                    {/* IBAN Box */}
                    <div className="p-2.5 rounded-xs bg-muted/40 border border-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          IBAN Number
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(settings.bankIban, "bank_iban")
                          }
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-background border border-border rounded-xs hover:border-primary text-foreground transition-colors cursor-pointer"
                        >
                          {copiedKey === "bank_iban" ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-muted-foreground" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <span className="font-mono font-bold text-[11px] sm:text-xs text-foreground block select-all break-all tracking-wider leading-relaxed">
                        {settings.bankIban}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 4. WHATSAPP BUTTON WITH AUTHENTIC WHATSAPP LOGO          */}
            {/* ======================================================== */}
            <div className="space-y-2.5 pt-2 text-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 text-xs uppercase tracking-[0.25em] font-semibold bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-xs shadow-sm transition-all inline-flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 fill-current shrink-0" />
                <span>Send Payment Screenshot on WhatsApp</span>
              </a>

              <div className="p-3 rounded-xs bg-muted/30 border border-border text-[11px] text-muted-foreground text-left sm:text-center leading-relaxed">
                <p>
                  <strong>Instructions:</strong> Tap the button above to open WhatsApp with your order details pre-filled. Please <strong>attach your payment receipt or screenshot</strong> in the chat and press Send.
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 5. PHYSICAL STORE & CONTACT CARD                         */}
          {/* ======================================================== */}
          <div className="border border-border p-4 sm:p-5 rounded-xs bg-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-foreground block">
                  Shop Address
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {settings.shopAddress}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right pl-12 sm:pl-0">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                Official Helpline / WhatsApp
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {settings.whatsappDisplayNumber || settings.whatsappNumber}
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 6. ORDER DETAILS SNAPSHOT                                */}
          {/* ======================================================== */}
          <div className="border border-border rounded-xs bg-card divide-y divide-border/60 text-xs shadow-2xs">
            <div className="p-4 sm:p-6 bg-muted/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-primary font-semibold block">
                  Items Purchased
                </span>
                <h3 className="font-serif text-lg font-normal text-foreground">
                  Order Summary ({order.items.length})
                </h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Recipient Snapshot */}
            <div className="p-4 sm:p-6 space-y-1.5 bg-muted/5 text-muted-foreground">
              <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] mb-2">
                Shipping & Delivery Recipient
              </h4>
              <p>
                <strong className="text-foreground">Name:</strong>{" "}
                {order.customer.name}
              </p>
              <p>
                <strong className="text-foreground">Phone:</strong>{" "}
                {order.customer.phone}
              </p>
              {order.customer.email && (
                <p>
                  <strong className="text-foreground">Email:</strong>{" "}
                  {order.customer.email}
                </p>
              )}
              <p>
                <strong className="text-foreground">Address:</strong>{" "}
                {order.customer.address}, {order.customer.city},{" "}
                {order.customer.province}, {order.customer.country}
              </p>
              <div className="flex items-center gap-2 pt-1 text-primary font-medium text-[11px]">
                <Truck className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Delivery Estimate: {order.shipping.deliveryEstimate}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className="p-4 sm:p-6 space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 aspect-[3/4] rounded-xs overflow-hidden bg-muted/40 border border-border shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
                          BFH
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Size: <span className="font-semibold">{item.size}</span>{" "}
                        · Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-sans font-semibold text-foreground tabular-nums">
                    PKR {item.itemTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="p-4 sm:p-6 space-y-2.5 bg-muted/15">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-sans font-medium text-foreground tabular-nums">
                  PKR {order.pricing.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span className="font-sans font-medium text-foreground tabular-nums">
                  {order.pricing.shippingType === "international_weight_based"
                    ? "Weight-based (calculated separately)"
                    : `PKR ${order.pricing.shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border font-bold text-sm text-foreground">
                <span>Total Amount</span>
                <span className="font-sans text-base font-bold text-foreground tabular-nums">
                  PKR {order.pricing.total.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-border/70 text-xs">
                <span className="font-semibold text-primary">
                  Advance Payment Required
                </span>
                <span className="font-sans font-bold text-primary tabular-nums">
                  PKR {order.pricing.advanceAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Remaining Payable on Delivery (COD)
                </span>
                <span className="font-sans font-bold text-foreground tabular-nums">
                  PKR {order.pricing.remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Exchange Guarantee */}
            <div className="p-4 bg-muted/30 flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center">
              <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>
                Exchange available within 2 days for valid reasons. Items must be unused and unwashed. All sales are final.
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-foreground border border-border hover:border-foreground transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
