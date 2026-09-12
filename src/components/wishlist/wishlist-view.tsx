"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlistHydrated, useWishlistStore } from "@/lib/wishlist-store";
import { ShopCard } from "@/components/shop/shop-card";
import { toast } from "sonner";

export function WishlistView() {
  const { items, hasHydrated } = useWishlistHydrated();
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  // Before hydration, render subtle skeleton placeholders
  if (!hasHydrated) {
    return (
      <div className="py-12 space-y-8 animate-pulse">
        <div className="h-8 bg-muted/60 rounded-xs w-48 mx-auto" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xs bg-muted/40 border border-border/40" />
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-secondary/80 text-primary flex items-center justify-center mx-auto mb-6 shadow-2xs">
          <Heart className="w-8 h-8 stroke-[1.5]" />
        </div>

        <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium block mb-2">
          BEHRUZ FASHION HOUSE
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground mb-3">
          Your Wishlist is Empty
        </h1>

        <p className="text-sm text-muted-foreground font-light leading-relaxed mb-8">
          You haven&apos;t saved any pieces yet. Browse our handcrafted luxury pret and couture collections to curate your personal wishlist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-xs uppercase tracking-[0.22em] font-medium bg-[#FF3154] text-white hover:bg-[#FF3154]/90 transition-colors shadow-xs"
          >
            <span>Explore Collection</span>
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link
            href="/cart"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.22em] font-medium text-foreground border border-border hover:border-foreground transition-colors"
          >
            <ShoppingBag className="mr-2 w-4 h-4" />
            <span>View Bag</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      clearWishlist();
      toast.info("Wishlist cleared");
    }
  };

  // Populated Grid State
  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold block mb-1">
            Curated Favorites
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
            My Wishlist ({items.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-red-500 transition-colors py-1 px-2.5 rounded-xs border border-transparent hover:border-border cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary font-semibold hover:underline"
          >
            <span>Discover More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {items.map((item) => (
          <div key={item._id} className="flex flex-col">
            <ShopCard product={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishlistView;
