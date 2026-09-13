import React from "react";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default function AdminProductsLoading() {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-6">
        {/* Skeleton Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-40 h-3 bg-muted rounded-xs animate-pulse" />
            <div className="w-56 h-8 bg-muted rounded-xs animate-pulse" />
            <div className="w-80 h-3 bg-muted rounded-xs animate-pulse" />
          </div>
          <div className="w-32 h-9 bg-muted rounded-xs animate-pulse" />
        </div>

        {/* Skeleton Metric Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={`metric-skeleton-${i}`}
              className="p-4 rounded-xs border border-border bg-card shadow-2xs space-y-2 animate-pulse"
            >
              <div className="w-20 h-2.5 bg-muted rounded-xs" />
              <div className="w-16 h-7 bg-muted rounded-xs" />
            </div>
          ))}
        </div>

        {/* Skeleton Search & Filter Bar */}
        <div className="p-3 bg-card rounded-xs border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-pulse">
          <div className="w-full sm:w-80 h-9 bg-muted rounded-xs" />
          <div className="w-48 h-9 bg-muted rounded-xs self-end sm:self-auto" />
        </div>

        {/* Skeleton Product Rows (5 rows) */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={`product-skeleton-${i}`}
              className="bg-card border border-border rounded-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Image placeholder */}
                <div className="w-16 h-20 sm:w-20 sm:h-24 bg-muted rounded-xs shrink-0" />
                {/* Details placeholder */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-48 sm:w-64 h-5 bg-muted rounded-xs" />
                    <div className="w-16 h-4 bg-muted rounded-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-4 bg-muted rounded-xs" />
                    <div className="w-12 h-4 bg-muted rounded-xs" />
                    <div className="w-12 h-4 bg-muted rounded-xs" />
                    <div className="w-24 h-4 bg-muted rounded-xs" />
                  </div>
                </div>
              </div>

              {/* Price placeholder */}
              <div className="hidden md:flex flex-col items-end space-y-1.5 min-w-[120px]">
                <div className="w-20 h-3 bg-muted rounded-xs" />
                <div className="w-24 h-5 bg-muted rounded-xs" />
              </div>

              {/* Action buttons placeholder */}
              <div className="flex items-center gap-2">
                <div className="w-14 h-8 bg-muted rounded-xs" />
                <div className="w-16 h-8 bg-muted rounded-xs" />
                <div className="w-16 h-8 bg-muted rounded-xs" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
