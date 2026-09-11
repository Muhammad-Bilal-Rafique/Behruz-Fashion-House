"use client";

import React from "react";

interface ShopSkeletonProps {
  count?: number;
}

export function ShopSkeleton({ count = 8 }: ShopSkeletonProps) {
  return (
    <div
      aria-label="Loading products"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full animate-pulse"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col space-y-3">
          {/* Image Placeholder (3:4 ratio) */}
          <div className="w-full aspect-[3/4] bg-muted/70 rounded-xs" />

          {/* Text Content Placeholders */}
          <div className="space-y-2 pt-1">
            {/* Title */}
            <div className="h-4 bg-muted/80 rounded-xs w-4/5" />
            {/* Price */}
            <div className="h-3.5 bg-muted/60 rounded-xs w-1/3" />
            {/* Colours */}
            <div className="h-3 bg-muted/50 rounded-xs w-1/2" />
            {/* Sizes */}
            <div className="h-2.5 bg-muted/40 rounded-xs w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ShopSkeleton;
