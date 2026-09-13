"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminDashboardError({
  error,
  reset,
}: DashboardErrorProps) {
  useEffect(() => {
    console.error("Admin dashboard error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xs shadow-lg max-w-md w-full p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-serif text-xl font-normal text-foreground">
            Unable to load dashboard
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error.message ||
              "Something went wrong while loading your store overview. Please check your database connection or try again."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={reset}
            className="gap-1.5 text-xs h-9 rounded-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>

          <Link href="/admin/orders">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders</span>
            </Button>
          </Link>

          <Link href="/admin/products">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
