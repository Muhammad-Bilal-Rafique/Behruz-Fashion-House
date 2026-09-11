"use client";

import React from "react";
import Link from "next/link";
import { PackageX, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-secondary/80 text-primary flex items-center justify-center mb-6">
        <PackageX className="w-8 h-8 stroke-[1.5]" />
      </div>

      <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
        Behruz Fashion House
      </span>

      <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground font-normal tracking-tight mb-3">
        Product Not Found
      </h1>

      <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-8 font-light">
        The luxury couture article you are looking for is currently unavailable, has been archived, or may not exist.
      </p>

      <Link
        href="/shop"
        className="inline-flex items-center justify-center gap-2 h-11 px-8 text-xs font-semibold tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground rounded-xs shadow-xs cursor-pointer transition-colors active:scale-[0.99]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shop</span>
      </Link>
    </div>
  );
}

interface ProductErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ProductErrorState({
  onRetry,
  isRetrying = false,
}: ProductErrorStateProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 stroke-[1.5]" />
      </div>

      <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
        Something Went Wrong
      </span>

      <h1 className="font-serif text-2xl sm:text-3xl text-foreground font-normal tracking-tight mb-3">
        Unable to Load Product
      </h1>

      <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-8 font-light">
        We encountered an issue retrieving the details for this article. Please try again or return to our full collection.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="w-full sm:w-auto h-11 px-8 text-xs font-semibold tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground rounded-xs shadow-xs cursor-pointer inline-flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
          <span>Try Again</span>
        </Button>

        <Link
          href="/shop"
          className="w-full sm:w-auto h-11 px-8 text-xs font-semibold tracking-widest uppercase border border-border bg-background hover:bg-muted/40 text-foreground rounded-xs cursor-pointer inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </Link>
      </div>
    </div>
  );
}
