import React from "react";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default function AdminOrdersLoading() {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-6">
        {/* Skeleton Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-36 h-3 bg-muted rounded-xs animate-pulse" />
            <div className="w-48 h-8 bg-muted rounded-xs animate-pulse" />
            <div className="w-72 h-3 bg-muted rounded-xs animate-pulse" />
          </div>
          <div className="w-24 h-9 bg-muted rounded-xs animate-pulse" />
        </div>

        {/* Skeleton Metric Cards (5 cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={`metric-skeleton-${i}`}
              className="p-4 rounded-xs border border-border bg-card shadow-2xs space-y-2 animate-pulse"
            >
              <div className="w-24 h-2.5 bg-muted rounded-xs" />
              <div className="w-16 h-7 bg-muted rounded-xs" />
              <div className="w-28 h-2 bg-muted rounded-xs" />
            </div>
          ))}
        </div>

        {/* Skeleton Search & Filter Bar */}
        <div className="p-4 bg-card rounded-xs border border-border space-y-3 animate-pulse">
          <div className="w-full sm:w-96 h-9 bg-muted rounded-xs" />
          <div className="w-full h-8 bg-muted/60 rounded-xs" />
        </div>

        {/* Skeleton Table Rows */}
        <div className="border border-border rounded-xs bg-card shadow-2xs overflow-hidden">
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={`order-row-skeleton-${i}`}
                className="flex items-center justify-between py-3 border-b border-border/60 last:border-0 animate-pulse gap-4"
              >
                <div className="w-28 h-4 bg-muted rounded-xs" />
                <div className="w-36 h-4 bg-muted rounded-xs" />
                <div className="w-28 h-4 bg-muted rounded-xs" />
                <div className="w-20 h-4 bg-muted rounded-xs" />
                <div className="w-24 h-4 bg-muted rounded-xs" />
                <div className="w-24 h-5 bg-muted rounded-full" />
                <div className="w-20 h-4 bg-muted rounded-xs" />
                <div className="w-16 h-7 bg-muted rounded-xs" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
