"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ShopHero } from "./shop-hero";
import { ShopToolbar, type SortOption } from "./shop-toolbar";
import { ShopCard, type ShopProduct } from "./shop-card";
import { ShopSkeleton } from "./shop-skeleton";
import { ShopEmptyState, ShopErrorState } from "./shop-states";
import { ShopBenefits } from "./shop-benefits";
import { ShopPagination } from "./shop-pagination";

const ITEMS_PER_PAGE = 12;

interface ShopContainerProps {
  initialProducts?: ShopProduct[];
}

export function ShopContainer({ initialProducts }: ShopContainerProps = {}) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || searchParams.get("search") || "";

  const [products, setProducts] = useState<ShopProduct[]>(initialProducts || []);
  const [isLoading, setIsLoading] = useState<boolean>(
    !initialProducts || initialProducts.length === 0
  );
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Filter and sort state - initialized from URL if present
  const [searchQuery, setSearchQuery] = useState<string>(urlQuery);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  // Keep searchQuery in sync if user navigates with different search params
  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  // Reset to page 1 whenever search query or sort option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const productsRef = useRef<ShopProduct[]>([]);
  productsRef.current = products;

  // Fetch real products from the existing API endpoint
  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      if (productsRef.current.length === 0) {
        setIsLoading(true);
      } else {
        setIsRetrying(true);
      }

      const res = await fetch("/api/products");

      if (!res.ok) {
        throw new Error(`Failed to fetch products (status: ${res.status})`);
      }

      const data = await res.json();

      if (!data.success || !Array.isArray(data.products)) {
        throw new Error(data.error || "Invalid response format from server");
      }

      // CRITICAL: Only active products are visible to customers.
      // Draft products are strictly filtered out and never displayed.
      const activeProducts: ShopProduct[] = data.products.filter(
        (product: ShopProduct) => product.status === "active"
      );

      setProducts(activeProducts);
    } catch (err: unknown) {
      console.error("Error fetching shop products:", err);
      setError("Unable to load products. Please check connection and retry.");
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if initialProducts were not provided by the server
    if (!initialProducts || initialProducts.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, initialProducts]);

  // Filter active products by Featured (when selected) and Search Query (name, description, fabric)
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter strictly for featured products when "featured" is selected
    if (sortBy === "featured") {
      result = result.filter((p) => p.isFeatured === true);
    }

    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return result;

    return result.filter((product) => {
      // 1. Match name
      const nameMatch =
        typeof product.name === "string" &&
        product.name.toLowerCase().includes(trimmedQuery);

      // 2. Match fabric
      const fabricMatch =
        typeof product.fabric === "string" &&
        product.fabric.toLowerCase().includes(trimmedQuery);

      // 3. Match description
      const descMatch =
        typeof product.description === "string" &&
        product.description.toLowerCase().includes(trimmedQuery);

      return nameMatch || fabricMatch || descMatch;
    });
  }, [products, searchQuery, sortBy]);

  // Sort filtered active products using discountedPrice (actual selling price)
  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts];

    switch (sortBy) {
      case "price-asc":
        return items.sort(
          (a, b) =>
            Number(a.discountedPrice || a.originalPrice || 0) -
            Number(b.discountedPrice || b.originalPrice || 0)
        );

      case "price-desc":
        return items.sort(
          (a, b) =>
            Number(b.discountedPrice || b.originalPrice || 0) -
            Number(a.discountedPrice || a.originalPrice || 0)
        );

      case "featured":
      case "newest":
      default:
        return items.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
    }
  }, [filteredProducts, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (gridTopRef.current) {
      const top = gridTopRef.current.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  };


  return (
    <div className="w-full">
      {/* Editorial Shop Hero Section */}
      <ShopHero />

      {/* Main Shop Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        {/* Search, Sort, and Dynamic Count Toolbar */}
        {!isLoading && !error && (
          <ShopToolbar
            totalVisible={sortedProducts.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {/* 1. Loading State */}
        {isLoading && <ShopSkeleton count={8} />}

        {/* 2. Error State */}
        {!isLoading && error && (
          <ShopErrorState
            onRetry={fetchProducts}
            isRetrying={isRetrying}
          />
        )}

        {/* 3. Empty State: No active products exist in the store */}
        {!isLoading && !error && products.length === 0 && (
          <ShopEmptyState type="no-products" />
        )}

        {/* 4. Empty State: Active products exist, but search query or featured filter returned 0 matches */}
        {!isLoading &&
          !error &&
          products.length > 0 &&
          sortedProducts.length === 0 && (
            <ShopEmptyState
              type={
                sortBy === "featured" && !searchQuery.trim()
                  ? "no-featured"
                  : "no-search-results"
              }
              searchQuery={searchQuery}
              onClearSearch={() => {
                setSearchQuery("");
                if (sortBy === "featured") {
                  setSortBy("newest");
                }
              }}
            />
          )}

        {/* Target anchor for smooth scroll on pagination */}
        <div ref={gridTopRef} />

        {/* 5. Product Grid: Desktop 4-col, Tablet 3-col, Mobile 2-col */}
        {!isLoading && !error && sortedProducts.length > 0 && (
          <>
            <div
              aria-label="Products Catalogue"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            >
              {paginatedProducts.map((product, index) => (
                <ShopCard
                  key={product._id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>

            {/* Shop Pagination */}
            <ShopPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={sortedProducts.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* 6. Shop Benefit & Trust Cards */}
        <ShopBenefits />
      </div>
    </div>
  );
}

export default ShopContainer;
