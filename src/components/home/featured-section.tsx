"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ShopCard, type ShopProduct } from "@/components/shop/shop-card";

interface FeaturedSectionProps {
  products: ShopProduct[];
}

export function FeaturedSection({ products }: FeaturedSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="featured-heading"
      className="relative w-full py-16 sm:py-24 bg-background border-b border-border/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium">
                SIGNATURE SELECTION
              </span>
            </div>
            <h2
              id="featured-heading"
              className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-foreground"
            >
              Featured Collection
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-light mt-2 max-w-xl leading-relaxed">
              Meticulously crafted creations defining timeless Pakistani craftsmanship,
              sumptuous fabrics, and regal silhouettes.
            </p>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-foreground hover:text-primary transition-colors duration-200 shrink-0 self-start md:self-end"
          >
            <span>View All Pieces</span>
            <ArrowRight
              className="w-4 h-4 text-primary transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {products.map((product, idx) => (
            <ShopCard
              key={product._id}
              product={product}
              priority={idx < 4}
            />
          ))}
        </motion.div>

        {/* Bottom CTA Button */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-3 px-8 py-3.5 border border-foreground/30 hover:border-primary text-foreground hover:text-primary text-xs uppercase tracking-[0.22em] font-medium transition-all duration-300 hover:bg-muted/30"
          >
            <span>Explore Complete Collection</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedSection;
