import React from "react";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-6">
        <div className="w-28 h-4 bg-muted rounded-xs animate-pulse" />

        {/* Header card skeleton */}
        <div className="bg-card border border-border rounded-xs p-6 shadow-2xs space-y-4 animate-pulse">
          <div className="space-y-2">
            <div className="w-32 h-3 bg-muted rounded-xs" />
            <div className="w-64 h-8 bg-muted rounded-xs" />
            <div className="w-48 h-3 bg-muted rounded-xs" />
          </div>
          <div className="w-full h-9 bg-muted/60 rounded-xs" />
        </div>

        {/* 2-column grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-card border border-border rounded-xs animate-pulse" />
            <div className="h-44 bg-card border border-border rounded-xs animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-card border border-border rounded-xs animate-pulse" />
            <div className="h-44 bg-card border border-border rounded-xs animate-pulse" />
            <div className="h-48 bg-card border border-border rounded-xs animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
