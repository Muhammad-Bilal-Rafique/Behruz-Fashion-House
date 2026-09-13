"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal, Loader2, CreditCard } from "lucide-react";

interface OrderSearchFilterProps {
  currentSearch: string;
  currentStatus: string;
  currentPaymentStatus: string;
}

export function OrderSearchFilter({
  currentSearch,
  currentStatus,
  currentPaymentStatus,
}: OrderSearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setSearchTerm(currentSearch);
    setIsDebouncing(false);
  }, [currentSearch]);

  // Debounced search input
  useEffect(() => {
    if (searchTerm === currentSearch) {
      setIsDebouncing(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsDebouncing(false);
      updateQuery({ search: searchTerm, page: "1" });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, currentSearch]);

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleStatusChange = (status: string) => {
    updateQuery({ status: status === "all" ? null : status, page: "1" });
  };

  const handlePaymentStatusChange = (paymentStatus: string) => {
    updateQuery({ paymentStatus: paymentStatus === "all" ? null : paymentStatus, page: "1" });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsDebouncing(false);
    updateQuery({ search: null, page: "1" });
  };

  const isSearching = isDebouncing || isPending;

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "awaiting_advance", label: "Awaiting Advance" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "dispatched", label: "Dispatched" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentOptions = [
    { value: "all", label: "All Payments" },
    { value: "pending", label: "Pending" },
    { value: "verified", label: "Verified" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-3 bg-card p-4 rounded-xs border border-border shadow-2xs">
      {/* Search Bar & Payment Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input with Eye-Catching In-Input Loader */}
        <div className="relative flex-1 max-w-lg">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              const val = e.target.value;
              setSearchTerm(val);
              if (val !== currentSearch) {
                setIsDebouncing(true);
              } else {
                setIsDebouncing(false);
              }
            }}
            placeholder="Search by order # (BFH-...), customer name, or phone..."
            className={`w-full pl-9 text-xs bg-background border rounded-xs focus:outline-hidden transition-all ${
              isSearching
                ? "border-primary/80 ring-2 ring-primary/20 pr-28 text-foreground"
                : "border-border focus:border-primary pr-9"
            } py-2.5`}
            aria-label="Search orders"
          />

          {isSearching ? (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/25 animate-in fade-in-50 duration-150 pointer-events-none">
              <Loader2 className="w-3 h-3 text-primary animate-spin stroke-[2.5]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Searching...
              </span>
            </div>
          ) : (
            searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-full transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>

        {/* Payment Status Dropdown / Pills */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <CreditCard className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline" />
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold hidden sm:inline">
            Payment:
          </span>
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xs border border-border">
            {paymentOptions.map((opt) => {
              const isActive =
                (!currentPaymentStatus && opt.value === "all") ||
                currentPaymentStatus === opt.value;

              return (
                <button
                  key={`pay-${opt.value}`}
                  type="button"
                  onClick={() => handlePaymentStatusChange(opt.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-card text-foreground font-semibold shadow-2xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Status Tabs / Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-border/60 pt-3">
        <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground mr-1 shrink-0" />
        {statusOptions.map((opt) => {
          const isActive =
            (!currentStatus && opt.value === "all") ||
            currentStatus === opt.value;

          return (
            <button
              key={`status-${opt.value}`}
              type="button"
              onClick={() => handleStatusChange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
