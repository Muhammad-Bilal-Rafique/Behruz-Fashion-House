"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { calculateDiscountPercentage } from "@/lib/utils";

export interface ShopProductImage {
  url: string;
  publicId?: string;
  isCover: boolean;
}

export interface ShopProduct {
  _id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  percentageOff?: number;
  fabric?: string;
  description: string;
  sizes: string[];
  sizeStock?: { size: string; stock: number }[];
  images: ShopProductImage[];
  status: "active" | "draft";
  isFeatured?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface ShopCardProps {
  product: ShopProduct;
  priority?: boolean;
}

export function ShopCard({ product, priority = false }: ShopCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Cover image logic: find isCover === true, fallback to first image in array
  const coverImage =
    product.images?.find((img) => img.isCover) || product.images?.[0];
  const imageUrl = coverImage?.url || "";

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  const origPrice = Number(product.originalPrice || 0);
  const discPrice = Number(product.discountedPrice || origPrice || 0);
  const discountPercent =
    product.percentageOff !== undefined
      ? product.percentageOff
      : calculateDiscountPercentage(origPrice, discPrice);

  const hasDiscount = discountPercent > 0 && origPrice > discPrice;

  const formattedOriginalPrice = `PKR ${origPrice.toLocaleString()}`;
  const formattedDiscountedPrice = `PKR ${discPrice.toLocaleString()}`;

  const sizesText =
    product.sizes && product.sizes.length > 0 ? product.sizes.join(" · ") : null;

  return (
    <article className="group relative flex flex-col w-full">
      <Link
        href={`/products/${product._id}`}
        className="flex flex-col h-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xs transition-shadow"
        aria-label={`View details for ${product.name}, priced at ${formattedDiscountedPrice}`}
      >
        {/* ======================================================== */}
        {/* Product Image Container (3:4 Portrait Ratio)             */}
        {/* ======================================================== */}
        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xs bg-[#F7F7F7] border border-border/50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${product.name} - Luxury Pakistani Couture`}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/40 text-muted-foreground/60 text-xs">
              Behruz Fashion House
            </div>
          )}

          {/* Top-Left Badges: Discount and/or Featured */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1 pointer-events-none">
            {hasDiscount && (
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 bg-[#FF3154] text-[#FFFFFF] rounded-xs shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 bg-black/75 text-[#FFFFFF] backdrop-blur-xs rounded-xs">
                Featured
              </span>
            )}
          </div>

          {/* Wishlist Button (Circular floating action) */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 hover:bg-white backdrop-blur-xs flex items-center justify-center text-foreground transition-all duration-200 shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-200 ${
                isWishlisted
                  ? "fill-[#FF3154] text-[#FF3154]"
                  : "text-foreground/80 hover:text-primary stroke-[1.75]"
              }`}
            />
          </button>
        </div>

        {/* ======================================================== */}
        {/* Product Details Section                                  */}
        {/* ======================================================== */}
        <div className="pt-3 pb-1 flex flex-col gap-1">
          {/* Product Name */}
          <h3 className="font-serif text-[15px] sm:text-base font-normal tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Pricing: Discounted in bold, Original struck through */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-xs sm:text-sm font-bold tracking-tight text-foreground">
              {formattedDiscountedPrice}
            </p>
            {hasDiscount && (
              <p className="text-[11px] sm:text-xs text-muted-foreground line-through font-normal">
                {formattedOriginalPrice}
              </p>
            )}
          </div>

          {/* Fabric indicator (if provided) */}
          {product.fabric && (
            <p className="text-[11px] text-muted-foreground/80 truncate font-light">
              {product.fabric}
            </p>
          )}

          {/* Available Sizes */}
          {sizesText && (
            <p className="text-[10px] sm:text-[11px] tracking-wider text-muted-foreground/60 uppercase font-mono">
              {sizesText}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

export default ShopCard;
