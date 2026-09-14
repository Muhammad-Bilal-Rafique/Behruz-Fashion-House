"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { useCartHydrated } from "@/lib/cart-store";
import { CheckoutForm, type CheckoutFormData } from "@/components/checkout/checkout-form";
import { type StockValidationItem } from "@/components/checkout/checkout-summary";
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/social-icons";
import {
  useStoreSettings,
  generateWhatsAppProofUrl,
} from "@/components/providers/store-settings-provider";
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
  const router = useRouter();
  const settings = useStoreSettings();
  const { items, hasHydrated, subtotal, clearCart } = useCartHydrated();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderData | null>(null);

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

      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        return;
      }

      if (data && data.validationMap) {
        const map = new Map<string, StockValidationItem>();
        let issuesFound = false;

        Object.entries(data.validationMap).forEach(([key, val]: [string, any]) => {
          map.set(key, val);
          if (val.status !== "valid") {
            issuesFound = true;
          }
        });

        setStockValidationMap(map);
        setHasStockIssues(issuesFound);
      }
    } catch {
      // Non-blocking on network failure
    } finally {
      setIsValidatingStock(false);
    }
  }, [items]);

  useEffect(() => {
    validateCartStock();
  }, [validateCartStock]);

  // Handle Order Placement
  const handlePlaceOrder = async (formData: CheckoutFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        customer: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          country: formData.country,
          province: formData.province,
          city: formData.city,
          address: formData.address,
        },
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        country: formData.country,
        province: formData.province,
        city: formData.city,
        address: formData.address,
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error("Unable to parse checkout response.");
      }

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("Stock Unavailable", {
            description: data?.error || "Some items are no longer available in the requested quantities.",
          });
          await validateCartStock();
          return;
        }

        toast.error("Checkout Failed", {
          description: data?.error || "Unable to process your order. Please try again.",
        });
        return;
      }

      // Successful order
      setConfirmedOrder(data.order);
      clearCart();
      toast.success("Order Received!", {
        description: `Order #${data.order.orderNumber} placed. Redirecting to payment instructions...`,
      });
      const tokenParam = data.order.customerAccessToken
        ? `?token=${encodeURIComponent(data.order.customerAccessToken)}`
        : "";
      router.push(`/order-success/${data.order.orderId}${tokenParam}`);
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

  // Generate WhatsApp confirmation URL with advance payment proof message
  const whatsappUrl = confirmedOrder
    ? generateWhatsAppProofUrl(
        confirmedOrder.orderNumber,
        confirmedOrder.customer.name,
        settings
      )
    : "";

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
              <div>
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold bg-[#FF3154] text-white mb-3">
                  Order Received — Advance Payment Required
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                  PKR {settings.advancePaymentAmount.toLocaleString()} Advance Payment Required
                </h1>
                <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                  Your order has been received successfully. A PKR {settings.advancePaymentAmount.toLocaleString()} advance payment is required to confirm your order.
                </p>
              </div>

              {/* Order Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 bg-muted/20 border border-border rounded-xs text-center text-xs">
                <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-border/70 pb-2 sm:pb-0">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Advance Amount
                  </span>
                  <span className="font-sans text-sm sm:text-base font-bold text-primary tabular-nums">
                    PKR {settings.advancePaymentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-0.5 border-b sm:border-b-0 sm:border-r border-border/70 pb-2 sm:pb-0">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Payment Status
                  </span>
                  <span className="inline-block font-sans text-xs sm:text-sm font-bold text-amber-600 uppercase">
                    Pending Verification
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Order Status
                  </span>
                  <span className="font-sans text-xs sm:text-sm font-bold text-foreground uppercase">
                    Awaiting Advance Payment
                  </span>
                </div>
              </div>

              {/* Order Reference Box */}
              <div className="p-3.5 rounded-xs bg-secondary/50 border border-border flex items-center justify-between gap-3 text-left">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
                    Order Reference
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-foreground">
                    #{confirmedOrder.orderNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
                    Total Amount
                  </span>
                  <span className="font-sans text-sm sm:text-base font-bold text-foreground tabular-nums">
                    PKR {confirmedOrder.pricing.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-[#25D366] text-white hover:bg-[#25D366]/90 transition-colors shadow-xs gap-2"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                  <span>Send Payment Screenshot on WhatsApp</span>
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

            {/* Checkout Form & Order Summary */}
            <CheckoutForm
              items={items}
              subtotal={subtotal}
              isSubmitting={isSubmitting}
              hasStockIssues={hasStockIssues}
              stockValidationMap={stockValidationMap}
              isValidatingStock={isValidatingStock}
              onSubmit={handlePlaceOrder}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
