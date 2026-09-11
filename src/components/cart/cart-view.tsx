"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useCartHydrated } from "@/lib/cart-store";
import { toast } from "sonner";

export function CartView() {
  const {
    items,
    hasHydrated,
    totalQuantity,
    subtotal,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartHydrated();

  // Handle loading skeleton during hydration to prevent SSR mismatch
  if (!hasHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
        <div className="h-4 bg-muted/60 rounded-xs w-36 mb-6" />
        <div className="h-8 bg-muted/80 rounded-xs w-48 mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-32 bg-muted/40 rounded-xs border border-border/60" />
            <div className="h-32 bg-muted/40 rounded-xs border border-border/60" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-64 bg-muted/40 rounded-xs border border-border/60" />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // EMPTY CART STATE
  // ============================================================
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li className="text-muted-foreground/40">/</li>
            <li aria-current="page" className="text-foreground font-medium">
              Shopping Bag
            </li>
          </ol>
        </nav>

        <div className="max-w-lg mx-auto py-12 px-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/80 text-primary flex items-center justify-center mb-6">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>

          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Behruz Fashion House
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground font-normal tracking-tight mb-3">
            Your cart is empty
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-8 font-light max-w-sm">
            Discover our curated collection of luxury Pakistani pret and couture to add timeless elegance to your wardrobe.
          </p>

          <Link
            href="/shop"
            className="h-12 px-8 text-xs font-semibold tracking-widest uppercase bg-[#FF3154] hover:bg-[#FF3154]/90 text-white rounded-xs shadow-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // POPULATED CART STATE
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
        <ol className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li className="text-muted-foreground/40">/</li>
          <li>
            <Link href="/shop" className="hover:text-foreground transition-colors">
              Shop
            </Link>
          </li>
          <li className="text-muted-foreground/40">/</li>
          <li aria-current="page" className="text-foreground font-medium">
            Shopping Bag ({totalQuantity})
          </li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-border/80 mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-foreground tracking-tight">
          Shopping Bag
        </h1>
        <button
          type="button"
          onClick={() => {
            clearCart();
            toast.info("Shopping bag cleared");
          }}
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-[#FF3154] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: Cart Line Items (8 cols on desktop)         */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-border/60">
            {items.map((item) => {
              const itemTotal = Number(item.price) * Number(item.quantity);

              return (
                <article
                  key={item.id}
                  className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
                >
                  {/* Product Image (3:4 ratio thumbnail) */}
                  <Link
                    href={`/products/${item.productId}`}
                    className="relative aspect-[3/4] w-24 sm:w-28 shrink-0 overflow-hidden rounded-xs bg-muted/40 border border-border/60 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                    aria-label={`View ${item.name}`}
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={`${item.name} product image`}
                        fill
                        sizes="120px"
                        className="object-cover object-center transition-transform hover:scale-105 duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground p-1 text-center">
                        Behruz
                      </div>
                    )}
                  </Link>

                  {/* Product Details & Information */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between w-full">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-serif text-base sm:text-lg font-normal text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold uppercase tracking-wider text-foreground">
                            Size: <span className="text-primary font-bold">{item.size}</span>
                          </span>
                        </div>
                      </div>

                      {/* Desktop Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          removeItem(item.id);
                          toast.info(`Removed "${item.name}" from bag`);
                        }}
                        aria-label={`Remove ${item.name} from bag`}
                        className="text-muted-foreground hover:text-[#FF3154] p-1 transition-colors cursor-pointer hidden sm:inline-flex"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>

                    {/* Unit Price & Quantity & Item Total Row */}
                    <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-4">
                      {/* Unit Price */}
                      <div className="text-xs text-muted-foreground">
                        <span className="block text-[10px] uppercase tracking-wider">Unit Price</span>
                        <span className="font-medium text-foreground text-xs sm:text-sm">
                          PKR {Number(item.price).toLocaleString()}
                        </span>
                      </div>

                      {/* Quantity Controls: [-] 1 [+] */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
                          Quantity:
                        </span>
                        <div className="inline-flex items-center border border-border rounded-xs bg-white h-9">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="w-8 h-full flex items-center justify-center text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.maxStock ?? 999}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              const max = item.maxStock ?? 999;
                              updateQuantity(item.id, isNaN(val) ? 1 : Math.min(val, max));
                            }}
                            aria-label={`Quantity of ${item.name}`}
                            className="w-10 h-full text-center text-xs font-semibold text-foreground focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (item.maxStock !== undefined && item.quantity >= item.maxStock) {
                                toast.info("Maximum available quantity reached", { duration: 2500 });
                                return;
                              }
                              increaseQuantity(item.id);
                            }}
                            disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="w-8 h-full flex items-center justify-center text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Item Total</span>
                        <span className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                          PKR {itemTotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Mobile Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          removeItem(item.id);
                          toast.info(`Removed "${item.name}" from bag`);
                        }}
                        aria-label={`Remove ${item.name} from bag`}
                        className="text-xs text-muted-foreground hover:text-[#FF3154] transition-colors cursor-pointer sm:hidden inline-flex items-center gap-1 mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border/80 flex items-center justify-between">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Order Summary (4 cols on desktop)          */}
        {/* ======================================================== */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-xs bg-muted/20 border border-border/70 sticky top-24 space-y-6">
            <h2 className="font-serif text-xl font-normal text-foreground tracking-tight pb-3 border-b border-border/60">
              Order Summary
            </h2>

            {/* Subtotal Calculation */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Total Items</span>
                <span className="text-foreground font-medium">{totalQuantity}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Subtotal
                </span>
                <span className="font-bold text-lg text-foreground tracking-tight">
                  PKR {subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Primary Checkout Action CTA */}
            <div className="pt-2">
              <Link
                href="/checkout"
                className="w-full h-12 bg-[#FF3154] hover:bg-[#FF3154]/90 text-white text-xs font-semibold tracking-widest uppercase rounded-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF3154] focus-visible:ring-offset-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[11px] text-muted-foreground text-center mt-2.5 font-light">
                Prices and inventory confirmed at order processing.
              </p>
            </div>

            {/* Service Highlights */}
            <div className="pt-4 border-t border-border/60 space-y-2.5 text-[11px] text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <Truck className="w-3.5 h-3.5 text-[#FF3154] shrink-0 mt-0.5" />
                <span>Express courier delivery across Pakistan & international destinations.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#FF3154] shrink-0 mt-0.5" />
                <span>2-day exchange available for valid reasons on unused pieces.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF3154] shrink-0 mt-0.5" />
                <span>Dedicated customer assistance for every order.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartView;
