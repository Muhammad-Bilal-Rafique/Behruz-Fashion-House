import React from "react";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-32 h-3 bg-muted rounded-xs animate-pulse" />
            <div className="w-48 h-8 bg-muted rounded-xs animate-pulse" />
            <div className="w-72 h-3 bg-muted rounded-xs animate-pulse" />
          </div>
          <div className="w-44 h-5 bg-muted rounded-xs animate-pulse" />
        </div>

        {/* Top Summary Cards Skeleton (6 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={`metric-skeleton-${i}`}
              className="p-4 rounded-xs border border-border bg-card shadow-2xs space-y-2.5 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="w-16 h-2.5 bg-muted rounded-xs" />
                <div className="w-4 h-4 bg-muted rounded-xs" />
              </div>
              <div className="w-12 h-7 bg-muted rounded-xs" />
              <div className="w-20 h-2 bg-muted rounded-xs" />
            </div>
          ))}
        </div>

        {/* Revenue & Lifecycle Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-xs border border-border bg-card shadow-2xs space-y-3 animate-pulse">
            <div className="w-32 h-3 bg-muted rounded-xs" />
            <div className="w-48 h-8 bg-muted rounded-xs" />
            <div className="w-40 h-2.5 bg-muted rounded-xs" />
          </div>
          <div className="lg:col-span-2 p-5 rounded-xs border border-border bg-card shadow-2xs space-y-3 animate-pulse">
            <div className="w-36 h-3 bg-muted rounded-xs" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="space-y-1.5">
                  <div className="w-14 h-2.5 bg-muted rounded-xs" />
                  <div className="w-10 h-5 bg-muted rounded-xs" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders & Awaiting Advance 2-Column Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders (2 cols) */}
          <div className="lg:col-span-2 border border-border rounded-xs bg-card p-5 space-y-4 shadow-2xs animate-pulse">
            <div className="flex items-center justify-between">
              <div className="w-32 h-5 bg-muted rounded-xs" />
              <div className="w-24 h-4 bg-muted rounded-xs" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((r) => (
                <div
                  key={r}
                  className="h-12 border border-border/60 rounded-xs bg-muted/40"
                />
              ))}
            </div>
          </div>

          {/* Awaiting Advance Queue (1 col) */}
          <div className="border border-border rounded-xs bg-card p-5 space-y-4 shadow-2xs animate-pulse">
            <div className="w-40 h-5 bg-muted rounded-xs" />
            <div className="space-y-3">
              {[1, 2, 3].map((a) => (
                <div
                  key={a}
                  className="h-20 border border-border/60 rounded-xs bg-muted/40"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Products & Shipping Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-border rounded-xs bg-card p-5 space-y-4 shadow-2xs animate-pulse">
            <div className="flex items-center justify-between">
              <div className="w-32 h-5 bg-muted rounded-xs" />
              <div className="w-24 h-4 bg-muted rounded-xs" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((p) => (
                <div
                  key={p}
                  className="h-14 border border-border/60 rounded-xs bg-muted/40"
                />
              ))}
            </div>
          </div>

          <div className="border border-border rounded-xs bg-card p-5 space-y-4 shadow-2xs animate-pulse">
            <div className="w-36 h-5 bg-muted rounded-xs" />
            <div className="space-y-3">
              <div className="h-16 border border-border/60 rounded-xs bg-muted/40" />
              <div className="h-16 border border-border/60 rounded-xs bg-muted/40" />
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="border border-border rounded-xs bg-card p-5 space-y-4 shadow-2xs animate-pulse">
          <div className="w-28 h-5 bg-muted rounded-xs" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((q) => (
              <div key={q} className="h-10 bg-muted/60 rounded-xs" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
