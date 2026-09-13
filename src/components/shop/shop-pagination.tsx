"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function ShopPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: ShopPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with smart ellipsis windowing
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Shop catalogue pagination"
      className="mt-12 sm:mt-16 pt-8 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      {/* Showing count indicator */}
      <p className="text-xs text-muted-foreground font-light order-2 sm:order-1">
        Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
        <span className="font-semibold text-foreground">{endItem}</span> of{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> creations
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className={`h-9 px-3 rounded-xs text-xs font-medium uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
            currentPage <= 1
              ? "opacity-35 cursor-not-allowed text-muted-foreground border border-border/40"
              : "border border-border bg-card text-foreground hover:border-primary hover:text-primary active:scale-[0.98]"
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Previous</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-9 flex items-center justify-center text-xs text-muted-foreground select-none"
                >
                  &hellip;
                </span>
              );
            }

            const isActive = p === currentPage;

            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Go to page ${p}`}
                aria-current={isActive ? "page" : undefined}
                className={`w-9 h-9 rounded-xs text-xs font-medium transition-all flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-[#FF3154] text-white shadow-xs font-semibold select-none pointer-events-none"
                    : "border border-border bg-card text-foreground hover:border-primary hover:text-primary active:scale-[0.98]"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className={`h-9 px-3 rounded-xs text-xs font-medium uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
            currentPage >= totalPages
              ? "opacity-35 cursor-not-allowed text-muted-foreground border border-border/40"
              : "border border-border bg-card text-foreground hover:border-primary hover:text-primary active:scale-[0.98]"
          }`}
        >
          <span className="hidden sm:inline text-[11px]">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
}

export default ShopPagination;
