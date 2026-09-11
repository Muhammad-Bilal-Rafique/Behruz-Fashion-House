"use client";

import React from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc";

interface ShopToolbarProps {
  totalVisible?: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
}

export function ShopToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: ShopToolbarProps) {
  return (
    <section
      aria-label="Product Search and Filter Toolbar"
      className="w-full py-4 border-y border-border/70 mb-8 sm:mb-10 bg-background"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
            <label htmlFor="shop-search-input" className="sr-only">
              Search products by name, fabric, or description
            </label>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Search className="w-3.5 h-3.5 stroke-[1.75]" />
            </div>

            <input
              id="shop-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full h-9 pl-9 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xs placeholder:text-muted-foreground/70 focus:outline-hidden focus:border-primary/60 focus:ring-1 focus:ring-primary/60 transition-all"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search input"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="relative flex items-center shrink-0">
            <label htmlFor="shop-sort-select" className="sr-only">
              Sort products by
            </label>
            <div className="flex items-center gap-1.5 h-9 px-3 bg-muted/30 border border-border/80 rounded-xs text-xs text-foreground hover:border-border transition-colors">
              <ArrowUpDown className="w-3 h-3 text-muted-foreground stroke-[1.75]" />
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider hidden sm:inline">
                Sort:
              </span>
              <select
                id="shop-sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Sort products"
                className="bg-transparent text-xs font-medium text-foreground focus:outline-hidden cursor-pointer pr-1"
              >
                <option value="newest">Newest</option>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>
  );
}

export default ShopToolbar;
