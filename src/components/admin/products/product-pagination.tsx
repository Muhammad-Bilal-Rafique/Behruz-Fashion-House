"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

export function ProductPagination({
  currentPage,
  totalPages,
  totalProducts,
  limit,
}: ProductPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalProducts <= 0) {
    return null;
  }

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalProducts);

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNumber));
    return `${pathname}?${params.toString()}`;
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-border">
      {/* Item Range Count */}
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{startItem}</span>–
        <span className="font-semibold text-foreground">{endItem}</span> of{" "}
        <span className="font-semibold text-foreground">{totalProducts}</span> products
      </p>

      {/* Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          {currentPage > 1 ? (
            <Link href={createPageUrl(currentPage - 1)}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs gap-1 rounded-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8 px-2.5 text-xs gap-1 rounded-xs opacity-40 cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>
          )}

          {/* Page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-xs text-muted-foreground select-none"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = Number(p);
              const isCurrent = pageNum === currentPage;

              return (
                <Link key={`page-${pageNum}`} href={createPageUrl(pageNum)}>
                  <Button
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs font-medium rounded-xs ${
                      isCurrent
                        ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Next Button */}
          {currentPage < totalPages ? (
            <Link href={createPageUrl(currentPage + 1)}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs gap-1 rounded-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8 px-2.5 text-xs gap-1 rounded-xs opacity-40 cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
