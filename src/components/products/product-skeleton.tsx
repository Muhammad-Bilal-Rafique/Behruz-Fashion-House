"use client";

import React from "react";

export function ProductDetailSkeleton() {
  return (
    <div
      aria-label="Loading product details"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse"
    >
      {/* 1. Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        <div className="h-3.5 bg-muted/80 rounded-xs w-12" />
        <div className="text-muted-foreground/30 text-xs">/</div>
        <div className="h-3.5 bg-muted/80 rounded-xs w-10" />
        <div className="text-muted-foreground/30 text-xs">/</div>
        <div className="h-3.5 bg-muted/60 rounded-xs w-28" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* ======================================================== */}
        {/* LEFT: Image Gallery Skeleton (7 cols on desktop)          */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image Placeholder (3:4 ratio) */}
          <div className="w-full aspect-[3/4] rounded-xs bg-muted/70 border border-border/50" />

          {/* Thumbnails Row Skeleton */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xs bg-muted/60 border border-border/40"
              />
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT: Product Information Skeleton (5 cols on desktop)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title Placeholder */}
          <div className="space-y-2">
            <div className="h-8 sm:h-9 bg-muted/80 rounded-xs w-3/4" />
            <div className="h-8 sm:h-9 bg-muted/80 rounded-xs w-1/2" />
          </div>

          {/* Pricing Placeholder */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-border/60">
            <div className="h-8 bg-muted/90 rounded-xs w-32" />
            <div className="h-5 bg-muted/60 rounded-xs w-24" />
            <div className="h-5 bg-muted/50 rounded-xs w-16" />
          </div>

          {/* Size Selector Placeholder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted/70 rounded-xs w-24" />
              <div className="h-3 bg-muted/50 rounded-xs w-36" />
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-11 rounded-xs bg-muted/60 border border-border/50" />
              ))}
            </div>
          </div>

          {/* Quantity Selector Placeholder */}
          <div className="space-y-2 pt-1">
            <div className="h-3.5 bg-muted/70 rounded-xs w-16" />
            <div className="h-11 w-32 rounded-xs bg-muted/60 border border-border/50" />
          </div>

          {/* Action CTAs Placeholder */}
          <div className="space-y-3 pt-2">
            <div className="h-12 w-full rounded-xs bg-muted/80" />
            <div className="h-12 w-full rounded-xs bg-muted/50 border border-border/50" />
          </div>

          {/* Description Placeholder */}
          <div className="space-y-2 pt-4 border-t border-border/60">
            <div className="h-4 bg-muted/70 rounded-xs w-36" />
            <div className="h-3.5 bg-muted/50 rounded-xs w-full" />
            <div className="h-3.5 bg-muted/50 rounded-xs w-5/6" />
            <div className="h-3.5 bg-muted/50 rounded-xs w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailSkeleton;
