"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { type CartItem } from "@/lib/cart-store";
import { AlertCircle, CheckCircle2, ShieldCheck, Truck, Sparkles } from "lucide-react";

export interface StockValidationItem {
  productId: string;
  size: string;
  requestedQuantity: number;
  availableStock: number;
  currentPrice: number;
  name: string;
  status: "valid" | "insufficient_stock" | "out_of_stock" | "inactive" | "not_found";
  message: string;
}

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  isInternational: boolean;
  stockValidationMap?: Map<string, StockValidationItem>;
  isValidatingStock?: boolean;
}

export function CheckoutSummary({
  items,
  subtotal,
  shippingFee,
  isInternational,
  stockValidationMap,
  isValidatingStock = false,
}: CheckoutSummaryProps) {
  const total = subtotal + (isInternational ? 0 : shippingFee);

  return (
    <div className="border border-border rounded-xs bg-card shadow-2xs overflow-hidden sticky top-24">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold block mb-0.5">
              Summary
            </span>
            <h2 className="font-serif text-xl font-normal text-foreground">
              Order Details ({items.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
          </div>
          <Link
            href="/cart"
            className="text-xs uppercase tracking-wider font-semibold text-primary hover:underline"
          >
            Edit Bag
          </Link>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="divide-y divide-border/60 max-h-[360px] overflow-y-auto p-6 space-y-4">
        {items.map((item) => {
          const itemKey = `${item.productId}-${item.size}`;
          const stockInfo = stockValidationMap?.get(itemKey);
          const hasIssue = stockInfo && stockInfo.status !== "valid";

          return (
            <div key={item.id} className="pt-4 first:pt-0 flex items-start gap-4">
              {/* Product Thumbnail (3:4 ratio) */}
              <div className="relative aspect-[3/4] w-16 sm:w-20 shrink-0 rounded-xs overflow-hidden bg-muted/40 border border-border">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                    Behruz
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-sm font-normal text-foreground line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded-xs bg-muted border border-border text-[10px] font-semibold uppercase text-foreground">
                    Size: {item.size}
                  </span>
                  <span>Qty: {item.quantity}</span>
                </div>

                <div className="mt-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    PKR {item.price.toLocaleString()} each
                  </span>
                  <span className="text-xs font-semibold text-foreground font-mono">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>

                {/* Stock Warning Badge if applicable */}
                {hasIssue && (
                  <div className="mt-2 p-1.5 rounded-xs bg-red-500/10 border border-red-500/30 text-[11px] text-red-600 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{stockInfo.message}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing Breakdown */}
      <div className="p-6 bg-muted/10 border-t border-border space-y-3 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono text-foreground font-medium">
            PKR {subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex items-start justify-between text-muted-foreground">
          <div>
            <span>Delivery Fee</span>
            {isInternational && (
              <span className="block text-[10px] text-muted-foreground italic">
                Weight-based international delivery
              </span>
            )}
          </div>
          <div className="text-right">
            {isInternational ? (
              <span className="text-xs font-semibold text-primary">
                To be calculated
              </span>
            ) : (
              <span className="font-mono text-foreground font-medium">
                PKR {shippingFee.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-border flex items-baseline justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Total Amount
            </span>
            {isInternational && (
              <span className="block text-[10px] text-muted-foreground">
                Shipping calculated separately
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="font-serif text-lg sm:text-xl font-semibold text-foreground font-mono">
              PKR {total.toLocaleString()}
            </span>
            <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">
              PKR Net Payable
            </span>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Perks */}
      <div className="p-4 bg-muted/30 border-t border-border text-[11px] text-muted-foreground space-y-2">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>
            {isInternational
              ? "Worldwide shipping (approx. 10 business days)"
              : "Express dispatch (3–5 business days across Pakistan)"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>100% Authentic Pakistani Handcrafted Couture</span>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSummary;
