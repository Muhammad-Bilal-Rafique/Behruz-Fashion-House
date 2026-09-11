"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ProductDetailView, type ProductDetailData } from "./product-detail-view";
import { ProductDetailSkeleton } from "./product-skeleton";
import { ProductNotFound, ProductErrorState } from "./product-states";
import { RelatedProducts } from "./related-products";
import type { ShopProduct } from "@/components/shop/shop-card";

interface ProductDetailContainerProps {
  id: string;
}

export function ProductDetailContainer({ id }: ProductDetailContainerProps) {
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<"not-found" | "error" | null>(null);

  const productRef = useRef<ProductDetailData | null>(null);
  productRef.current = product;

  // Fetch product from the existing GET by ID endpoint
  const fetchProduct = useCallback(async () => {
    if (!id) {
      setErrorType("not-found");
      setIsLoading(false);
      return;
    }

    try {
      if (productRef.current) {
        setIsRetrying(true);
      } else {
        setIsLoading(true);
      }
      setErrorType(null);

      const res = await fetch(`/api/admin/products/${id}`, {
        cache: "no-store",
      });

      if (res.status === 404) {
        setErrorType("not-found");
        setProduct(null);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch product (status: ${res.status})`);
      }

      const data = await res.json();

      if (!data.success || !data.product) {
        setErrorType("not-found");
        setProduct(null);
        return;
      }

      const p = data.product;

      // Ensure customer-facing safety: active status check
      if (p.status === "draft") {
        setErrorType("not-found");
        setProduct(null);
        return;
      }

      setProduct({
        _id: String(p._id),
        name: p.name,
        originalPrice: Number(p.originalPrice || 0),
        discountedPrice: Number(p.discountedPrice || p.originalPrice || 0),
        percentageOff: p.percentageOff,
        description: p.description || "",
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        sizeStock: Array.isArray(p.sizeStock) ? p.sizeStock : [],
        images: Array.isArray(p.images) ? p.images : [],
        status: p.status || "active",
        isFeatured: Boolean(p.isFeatured),
      });

      // Fetch active related products
      try {
        const relRes = await fetch("/api/admin/products?status=active", {
          cache: "no-store",
        });
        if (relRes.ok) {
          const relData = await relRes.json();
          if (relData.success && Array.isArray(relData.products)) {
            const filtered = relData.products
              .filter((item: ShopProduct) => String(item._id) !== String(id))
              .slice(0, 4);
            setRelatedProducts(filtered);
          }
        }
      } catch (relErr) {
        console.error("Error loading related products:", relErr);
      }
    } catch (err) {
      console.error("Error fetching product by ID:", err);
      setErrorType("error");
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // 1. Loading State
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // 2. Product Not Found (404)
  if (errorType === "not-found" || !product) {
    return <ProductNotFound />;
  }

  // 3. Network or Server Error
  if (errorType === "error") {
    return (
      <ProductErrorState onRetry={fetchProduct} isRetrying={isRetrying} />
    );
  }

  // 4. Successful Display
  return (
    <div className="w-full">
      <ProductDetailView product={product} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}

export default ProductDetailContainer;
