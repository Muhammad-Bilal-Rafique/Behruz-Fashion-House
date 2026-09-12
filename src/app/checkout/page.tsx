"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { useCartHydrated } from "@/lib/cart-store";
import { CheckoutForm, type CheckoutFormData } from "@/components/checkout/checkout-form";
import {
  CheckoutSummary,
  type StockValidationItem,
} from "@/components/checkout/checkout-summary";
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Phone,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ConfirmedOrderData {
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
  };
  shipping: {
    country: string;
    province: string;
    deliveryEstimate: string;
  };
  payment: {
    method: string;
  };
  items: {
    productId: string;
    name: string;
    image: string;
    size: string;
    quantity: number;
    price: number;
    itemTotal: number;
  }[];
}

export default function CheckoutPage() {
  const { items, hasHydrated, subtotal, clearCart } = useCartHydrated();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderData | null>(null);

  // Dynamic shipping state from form
  const [shippingFee, setShippingFee] = useState<number>(350);
  const [isInternational, setIsInternational] = useState<boolean>(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("Punjab");

  // Stock pre-validation state
  const [stockValidationMap, setStockValidationMap] = useState<
    Map<string, StockValidationItem>
  >(new Map());
  const [hasStockIssues, setHasStockIssues] = useState<boolean>(false);
  const [isValidatingStock, setIsValidatingStock] = useState<boolean>(false);

  // Validate cart items against live database stock
  const validateCartStock = useCallback(async () => {
    if (!items || items.length === 0) return;

    try {
      setIsValidatingStock(true);
      const res = await fetch("/api/checkout/validate-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
          })),
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const newMap = new Map<string, StockValidationItem>();
        data.items.forEach((validated: StockValidationItem) => {
          newMap.set(`${validated.productId}-${validated.size}`, validated);
        });
        setStockValidationMap(newMap);
        setHasStockIssues(Boolean(data.hasIssues));
      }
    } catch (err) {
      console.error("Error checking stock:", err);
    } finally {
      setIsValidatingStock(false);
    }
  }, [items]);

  useEffect(() => {
    if (hasHydrated && items.length > 0) {
      validateCartStock();
    }
  }, [hasHydrated, items.length, validateCartStock]);

  const handleShippingChange = useCallback(
    (fee: number, intl: boolean, province: string) => {
      setShippingFee(fee);
      setIsInternational(intl);
      setSelectedProvince(province);
    },
    []
  );

  // Handle Order Placement
  const handlePlaceOrder = async (formData: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error("Order Could Not Be Placed", {
          description: data.error || "Please check your details and try again.",
        });
        // Re-validate stock to reflect what is now sold out
        await validateCartStock();
        return;
      }

      // Successful order
      setConfirmedOrder(data.order);
      clearCart();
      toast.success("Order Placed Successfully!", {
        description: `Order #${data.order.orderNumber} has been received.`,
      });
    } catch (err) {
      console.error("Checkout network error:", err);
      toast.error("Network connection issue. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Loading Checkout...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // Generate WhatsApp confirmation URL
  const whatsappNumber = "923354623733";
  const whatsappMessage = confirmedOrder
    ? encodeURIComponent(
        `Hello Behruz Fashion House! I would like to confirm my order:\n\n` +
          `Order #: ${confirmedOrder.orderNumber}\n` +
          `Name: ${confirmedOrder.customer.name}\n` +
          `Phone: ${confirmedOrder.customer.phone}\n` +
          `City: ${confirmedOrder.customer.city}, ${confirmedOrder.customer.province}\n` +
          `Total: PKR ${confirmedOrder.pricing.total.toLocaleString()}\n\n` +
          `Please share tracking updates as soon as it's dispatched.`
      )
    : "";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 w-full">
        {confirmedOrder ? (
          /* ======================================================== */
          /* 1. ORDER SUCCESS & CONFIRMATION SCREEN                   */
          /* ======================================================== */
          <div className="max-w-2xl mx-auto py-8">
            <div className="border border-border bg-card p-6 sm:p-10 rounded-xs shadow-xs text-center space-y-6">
              {/* Success Badge */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold block mb-1">
                  Order Received
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
                  Thank You for Your Order!
                </h1>
                <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                  Your order has been recorded. Our team will prepare and dispatch your couture pieces promptly.
                </p>
              </div>

              {/* Order Number Box */}
              <div className="p-4 rounded-xs bg-secondary/50 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
                    Order Reference
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-foreground">
                    {confirmedOrder.orderNumber}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
                    Payment Method
                  </span>
                  <span className="text-xs font-semibold text-primary uppercase">
                    {confirmedOrder.payment.method === "cash_on_delivery"
                      ? "Cash on Delivery"
                      : "International Pending"}
                  </span>
                </div>
              </div>

              {/* Order Details & Summary Card */}
              <div className="border border-border rounded-xs text-left divide-y divide-border/60 text-xs">
                {/* Customer Snapshot */}
                <div className="p-4 space-y-1.5 bg-muted/15">
                  <h3 className="font-semibold text-foreground uppercase tracking-wider text-[11px] mb-2">
                    Shipping & Recipient
                  </h3>
                  <p>
                    <strong className="text-foreground">Name:</strong> {confirmedOrder.customer.name}
                  </p>
                  <p>
                    <strong className="text-foreground">Phone:</strong> {confirmedOrder.customer.phone}
                  </p>
                  {confirmedOrder.customer.email && (
                    <p>
                      <strong className="text-foreground">Email:</strong> {confirmedOrder.customer.email}
                    </p>
                  )}
                  <p>
                    <strong className="text-foreground">Address:</strong> {confirmedOrder.customer.address},{" "}
                    {confirmedOrder.customer.city}, {confirmedOrder.customer.province},{" "}
                    {confirmedOrder.customer.country}
                  </p>
                  <p className="text-primary font-medium pt-1">
                    Estimated Delivery: {confirmedOrder.shipping.deliveryEstimate}
                  </p>
                </div>

                {/* Items Purchased Snapshot */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                    Items in Order ({confirmedOrder.items.length})
                  </h3>
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 aspect-[3/4] rounded-xs overflow-hidden bg-muted/40 border border-border shrink-0">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Size: <span className="font-semibold">{item.size}</span> · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-foreground">
                        PKR {item.itemTotal.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="p-4 space-y-2 bg-muted/15">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono text-foreground">
                      PKR {confirmedOrder.pricing.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="font-mono text-foreground">
                      {confirmedOrder.pricing.shippingType === "international_weight_based"
                        ? "Calculated based on weight"
                        : `PKR ${confirmedOrder.pricing.shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border font-bold text-sm text-foreground">
                    <span>Total Amount</span>
                    <span className="font-mono text-base text-primary">
                      PKR {confirmedOrder.pricing.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Instructions Note */}
              {confirmedOrder.payment.method === "cash_on_delivery" ? (
                <div className="p-3 rounded-xs bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-left">
                  <strong>Cash on Delivery:</strong> Please keep the exact payable amount ready when the courier arrives at your address.
                </div>
              ) : (
                <div className="p-3 rounded-xs bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left">
                  <strong>International Shipping:</strong> Since charges depend on the package weight, our concierge will contact you via WhatsApp/Email to confirm the final shipping fee.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-[#25D366] text-white hover:bg-[#25D366]/90 transition-colors shadow-xs"
                >
                  <Phone className="mr-2 w-4 h-4" />
                  <span>Confirm on WhatsApp</span>
                </a>

                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-foreground border border-border hover:border-foreground transition-colors"
                >
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* ======================================================== */
          /* 2. EMPTY CART CHECKOUT GUARD                             */
          /* ======================================================== */
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-16 h-16 rounded-full bg-secondary text-primary flex items-center justify-center mx-auto mb-6 shadow-2xs">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>

            <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium block mb-2">
              BEHRUZ FASHION HOUSE
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground mb-3">
              Your cart is empty.
            </h1>

            <p className="text-sm text-muted-foreground font-light leading-relaxed mb-8">
              You haven&apos;t added any luxury couture pieces to your shopping bag yet. Browse our pret and festive creations to continue.
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 text-xs uppercase tracking-[0.22em] font-medium bg-[#FF3154] text-white hover:bg-[#FF3154]/90 transition-colors shadow-xs"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* ======================================================== */
          /* 3. ACTIVE CHECKOUT: TWO-COLUMN RESPONSIVE LAYOUT         */
          /* ======================================================== */
          <div>
            {/* Breadcrumb & Navigation */}
            <div className="mb-8">
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-3 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Return to Bag</span>
              </Link>
              <h1 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-foreground">
                Checkout & Shipping
              </h1>
            </div>

            {/* Stock Issues Banner if any item has issues */}
            {hasStockIssues && (
              <div className="mb-8 p-4 rounded-xs border border-red-500/40 bg-red-50 text-red-800 flex items-start gap-3 text-xs">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-sm">
                    Some items in your bag have inventory updates:
                  </strong>
                  <p className="mt-1 leading-relaxed">
                    One or more pieces have limited stock or have sold out. Please review the item warnings in your order summary or return to your bag to adjust quantities.
                  </p>
                </div>
              </div>
            )}

            {/* Responsive Grid: Left (Customer Info) & Right (Order Summary) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* LEFT: Customer & Shipping Information (7 cols) */}
              <div className="lg:col-span-7">
                <CheckoutForm
                  isSubmitting={isSubmitting}
                  hasStockIssues={hasStockIssues}
                  onSubmit={handlePlaceOrder}
                  onShippingChange={handleShippingChange}
                />
              </div>

              {/* RIGHT: Order Summary (5 cols) */}
              <div className="lg:col-span-5">
                <CheckoutSummary
                  items={items}
                  subtotal={subtotal}
                  shippingFee={shippingFee}
                  isInternational={isInternational}
                  stockValidationMap={stockValidationMap}
                  isValidatingStock={isValidatingStock}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
