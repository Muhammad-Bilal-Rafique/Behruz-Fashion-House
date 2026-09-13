"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminProductsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Admin products page error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xs shadow-lg max-w-md w-full p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-serif text-xl font-normal text-foreground">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error.message || "Failed to load product catalogue. Please check your database connection or try again."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={reset}
            className="gap-1.5 text-xs h-9 rounded-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>

          <Link href="/admin/orders">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-xs text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
