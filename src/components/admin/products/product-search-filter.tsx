"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";

interface ProductSearchFilterProps {
  currentSearch: string;
  currentStatus: string;
}

export function ProductSearchFilter({
  currentSearch,
  currentStatus,
}: ProductSearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Sync internal search term when URL changes externally
  useEffect(() => {
    setSearchTerm(currentSearch);
    setIsDebouncing(false);
  }, [currentSearch]);

  // Debounced navigation helper
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

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsDebouncing(false);
    updateQuery({ search: null, page: "1" });
  };

  const isSearching = isDebouncing || isPending;

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xs border border-border shadow-2xs">
      {/* Search Input Box with Eye-Catching In-Input Loader */}
      <div className="relative flex-1 max-w-md">
        {/* Left Icon: Animated Pink Spinner when searching, otherwise Search icon */}
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
          placeholder="Search products by name..."
          className={`w-full pl-9 text-xs bg-background border rounded-xs focus:outline-hidden transition-all ${
            isSearching
              ? "border-primary/80 ring-2 ring-primary/20 pr-28 text-foreground"
              : "border-border focus:border-primary pr-9"
          } py-2.5`}
          aria-label="Search products by name"
        />

        {/* Right Inside Action: Vibrant Pink Searching Badge when searching, or Clear button */}
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )
        )}
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xs border border-border">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground ml-1.5 mr-0.5 hidden sm:inline-block" />
          {statusOptions.map((opt) => {
            const isActive =
              (!currentStatus && opt.value === "all") ||
              currentStatus === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusChange(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-all cursor-pointer ${
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
  );
}
