"use client";

import React from "react";
import { Sparkles, SearchX, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "no-products" | "no-search-results" | "no-featured";
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function ShopEmptyState({
  type,
  searchQuery,
  onClearSearch,
}: EmptyStateProps) {
  if (type === "no-featured") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-secondary/70 flex items-center justify-center text-primary mb-4">
          <Sparkles className="w-5 h-5 stroke-[1.5]" />
        </div>
        <h3 className="font-serif text-xl sm:text-2xl text-foreground font-normal tracking-tight mb-2">
          No featured products yet
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
          Check back soon for specially curated featured pieces.
        </p>
        {onClearSearch && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearSearch}
            className="text-xs tracking-wider uppercase border-border hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            View All Products
          </Button>
        )}
      </div>
    );
  }

  if (type === "no-search-results") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
          <SearchX className="w-5 h-5 stroke-[1.5]" />
        </div>
        <h3 className="font-serif text-xl sm:text-2xl text-foreground font-normal tracking-tight mb-2">
          No products found
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
          {searchQuery ? (
            <>
              No results found for &ldquo;<span className="text-foreground font-medium">{searchQuery}</span>&rdquo;.
              Try searching for a different product, fabric, or colour.
            </>
          ) : (
            "Try searching for a different product, fabric, or colour."
          )}
        </p>
        {onClearSearch && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearSearch}
            className="text-xs tracking-wider uppercase border-border hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  // Type: "no-products" (when store has no active products)
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-secondary/70 flex items-center justify-center text-primary mb-4">
        <Sparkles className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h3 className="font-serif text-xl sm:text-2xl text-foreground font-normal tracking-tight mb-2">
        Nothing here yet
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        New pieces will be added soon.
      </p>
    </div>
  );
}

interface ErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ShopErrorState({ onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
        <AlertCircle className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h3 className="font-serif text-xl sm:text-2xl text-foreground font-normal tracking-tight mb-2">
        Unable to load products
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
        Something went wrong while loading the collection. Please try again.
      </p>
      <Button
        type="button"
        size="sm"
        disabled={isRetrying}
        onClick={onRetry}
        className="text-xs uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5 cursor-pointer shadow-xs gap-2"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
        <span>Try Again</span>
      </Button>
    </div>
  );
}
