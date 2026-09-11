"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShopCard, type ShopProduct } from "@/components/shop/shop-card";

interface RelatedProductsProps {
  products: ShopProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-products-heading" className="w-full pt-16 sm:pt-24 border-t border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold block mb-1">
            Curated Ensemble
          </span>
          <h2
            id="related-products-heading"
            className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-foreground tracking-tight"
          >
            Related Products
          </h2>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors group"
        >
          <span>Explore All Creations</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid: 2 cols on mobile, 3 cols on tablet, 4 cols on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {products.map((product) => (
          <ShopCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default RelatedProducts;
