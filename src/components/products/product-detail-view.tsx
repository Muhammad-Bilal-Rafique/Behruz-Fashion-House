"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Check,
  Minus,
  Plus,
  ArrowLeft,
  Sparkles,
  Ruler,
} from "lucide-react";
import { toast } from "sonner";
import { calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore, useWishlistHydrated } from "@/lib/wishlist-store";
import { SizeChartModal } from "./size-chart-modal";

export interface ProductDetailImage {
  url: string;
  publicId?: string;
  isCover: boolean;
}

export interface ProductDetailData {
  _id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  percentageOff?: number;
  description: string;
  sizes: string[];
  sizeStock?: { size: string; stock: number }[];
  images: ProductDetailImage[];
  status: "active" | "draft";
  isFeatured?: boolean;
}

interface ProductDetailViewProps {
  product: ProductDetailData;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const addItem = useCartStore((state) => state.addItem);
  // Gallery initial image: find isCover === true, fallback to index 0
  const initialImageIndex = (() => {
    if (!product.images || product.images.length === 0) return 0;
    const coverIdx = product.images.findIndex((img) => img.isCover);
    return coverIdx >= 0 ? coverIdx : 0;
  })();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(initialImageIndex);
  const [imageError, setImageError] = useState<boolean>(false);

  // Size selection: initially null so the user is required to explicitly select a size
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Quantity selector: min 1, defaults to 1
  const [quantity, setQuantity] = useState<number>(1);

  // Interaction states & stores
  const { isInWishlist } = useWishlistHydrated();
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = isInWishlist(product._id);
  const [isAddedToBag, setIsAddedToBag] = useState<boolean>(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);

  // Pricing calculations
  const origPrice = Number(product.originalPrice || 0);
  const discPrice = Number(product.discountedPrice || origPrice || 0);

  // Derived discount percentage (only applicable if discountedPrice < originalPrice)
  const discountPercent =
    origPrice > 0 && discPrice < origPrice
      ? calculateDiscountPercentage(origPrice, discPrice)
      : 0;

  const hasDiscount = discountPercent > 0 && discPrice < origPrice;

  const currentImage = product.images?.[selectedImageIndex] || product.images?.[0];

  // Helper to determine available inventory for any size
  const getSizeStock = (size: string): number => {
    if (!product.sizeStock || product.sizeStock.length === 0) {
      return 5; // Safe default for unmigrated products so sizes are never broken
    }
    const found = product.sizeStock.find(
      (item) => item.size.toLowerCase() === size.toLowerCase()
    );
    return found !== undefined ? Number(found.stock) : 5;
  };

  const selectedSizeStock = selectedSize ? getSizeStock(selectedSize) : 5;

  // Handle size selection and clamp quantity if necessary
  const handleSelectSize = (size: string) => {
    const stock = getSizeStock(size);
    if (stock <= 0) return;
    setSelectedSize(size);
    if (quantity > stock) {
      setQuantity(Math.max(1, stock));
    }
  };

  // Quantity handlers
  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrement = () => {
    if (selectedSize && quantity >= selectedSizeStock) {
      toast.info("Maximum available quantity reached", { duration: 2500 });
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
    } else {
      const maxAllowed = selectedSize ? selectedSizeStock : 999;
      setQuantity(Math.min(val, maxAllowed));
    }
  };

  // Add to Cart handler with live server-side stock validation
  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size", {
        description: "Choose an available size before adding to your shopping bag.",
        duration: 3500,
      });
      return;
    }

    const availableStock = getSizeStock(selectedSize);

    if (availableStock <= 0) {
      toast.error("Out of stock", {
        description: "This size is currently sold out.",
        duration: 3500,
      });
      return;
    }

    // Check existing quantity of this item already in the cart
    const currentItems = useCartStore.getState().items;
    const existing = currentItems.find(
      (item) => item.id === `${product._id}-${selectedSize}`
    );
    const inCartQty = existing ? existing.quantity : 0;

    if (inCartQty + quantity > availableStock) {
      const remainingCanAdd = Math.max(0, availableStock - inCartQty);
      if (remainingCanAdd <= 0) {
        toast.error("Maximum limit reached", {
          description:
            "You already have the maximum available quantity of this item in your shopping bag.",
          duration: 3500,
        });
        return;
      } else {
        toast.warning("Limited quantity available", {
          description: `You can only add ${remainingCanAdd} more of this size to your shopping bag.`,
          duration: 3500,
        });
        return;
      }
    }

    // Add to Zustand cart
    addItem({
      productId: product._id,
      name: product.name,
      size: selectedSize,
      quantity,
      price: discPrice,
      image: currentImage?.url || product.images?.[0]?.url || "",
      maxStock: availableStock,
    });

    setIsAddedToBag(true);
    toast.success("Added to cart", {
      description: `"${product.name}" (Size: ${selectedSize}, Qty: ${quantity}) added to your shopping bag.`,
      duration: 4000,
    });

    setTimeout(() => setIsAddedToBag(false), 2500);
  };

  // Wishlist handler
  const handleWishlistToggle = () => {
    const added = toggleWishlist(product as any);
    if (added) {
      toast.success("Saved to Wishlist", {
        description: `"${product.name}" is now in your wishlist.`,
      });
    } else {
      toast.info("Removed from Wishlist", {
        description: `"${product.name}" removed from wishlist.`,
      });
    }
  };

  // Share handler
  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* ======================================================== */}
      {/* 1. BREADCRUMB: Home / Shop / Product Name                */}
      {/* ======================================================== */}
      <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
        <ol className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <li>
            <Link
              href="/"
              className="hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            >
              Home
            </Link>
          </li>
          <li className="text-muted-foreground/40" aria-hidden="true">
            /
          </li>
          <li>
            <Link
              href="/shop"
              className="hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
            >
              Shop
            </Link>
          </li>
          <li className="text-muted-foreground/40" aria-hidden="true">
            /
          </li>
          <li
            aria-current="page"
            className="text-foreground font-medium truncate max-w-[200px] sm:max-w-md"
          >
            {product.name}
          </li>
        </ol>
      </nav>

      {/* ======================================================== */}
      {/* 2 & 3. PRODUCT GALLERY (LEFT) + INFORMATION (RIGHT)       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* ======================================================== */}
        {/* LEFT: Image Gallery (7 cols on desktop)                  */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Display Image (3:4 ratio) */}
          <div className="relative aspect-[3/4] w-full rounded-xs overflow-hidden bg-[#F7F7F7] border border-border/60 shadow-2xs">
            {currentImage?.url && !imageError ? (
              <Image
                src={currentImage.url}
                alt={`${product.name} product image`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center transition-all duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-muted/30 text-muted-foreground">
                <Sparkles className="w-8 h-8 text-muted-foreground/40 mb-2 stroke-[1.5]" />
                <span className="text-xs uppercase tracking-widest font-serif text-foreground/80">
                  Behruz Fashion House
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">
                  Luxury Pakistani Couture
                </span>
              </div>
            )}

            {/* Top-Left Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-1.5 pointer-events-none">
              {hasDiscount && (
                <span className="text-xs font-bold tracking-wider uppercase px-3 py-1 bg-[#FF3154] text-[#FFFFFF] rounded-xs shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
              {product.isFeatured && (
                <span className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-0.5 bg-black/80 text-white backdrop-blur-xs rounded-xs">
                  Featured Article
                </span>
              )}
            </div>

            {/* Top-Right Floating Wishlist Button */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs flex items-center justify-center text-foreground transition-all duration-200 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
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

          {/* Thumbnails row (Displayed only if multiple images exist) */}
          {product.images && product.images.length > 1 && (
            <div
              role="region"
              aria-label="Product thumbnail gallery"
              className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-1"
            >
              {product.images.map((img, idx) => {
                const isActive = selectedImageIndex === idx;
                return (
                  <button
                    key={img.publicId || `${img.url}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setImageError(false);
                    }}
                    aria-label={`View photo ${idx + 1} for ${product.name}`}
                    className={`relative aspect-[3/4] rounded-xs overflow-hidden border transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "border-[#FF3154] ring-2 ring-[#FF3154] opacity-100 shadow-xs"
                        : "border-border/70 opacity-70 hover:opacity-100 hover:border-foreground/30"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover object-center"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT: Product Information (5 cols on desktop)          */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Product Name */}
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-foreground tracking-tight leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing Row: Struck-through original + Bold discounted + Badge */}
          <div className="flex items-baseline gap-3 pt-1 pb-4 border-b border-border/60">
            <span className="font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
              PKR {discPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="line-through text-base sm:text-lg text-muted-foreground font-normal">
                  PKR {origPrice.toLocaleString()}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#FF3154]/10 text-[#FF3154] border border-[#FF3154]/20 rounded-xs">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Product Description snippet */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          {/* Size Selector */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-foreground">
                Select Size:{" "}
                {selectedSize ? (
                  <strong className="text-[#FF3154] font-bold">{selectedSize}</strong>
                ) : (
                  <span className="text-muted-foreground font-normal">
                    (Required)
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/40 hover:decoration-primary cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Chart</span>
              </button>
            </div>

            <div
              role="radiogroup"
              aria-label="Available product sizes"
              className="grid grid-cols-4 gap-2.5"
            >
              {product.sizes && product.sizes.length > 0 ? (
                product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const stock = getSizeStock(size);
                  const isOutOfStock = stock <= 0;

                  return (
                    <button
                      key={size}
                      type="button"
                      role="radio"
                      disabled={isOutOfStock}
                      aria-checked={isSelected}
                      aria-disabled={isOutOfStock}
                      onClick={() => handleSelectSize(size)}
                      className={`h-11 rounded-xs border text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF3154] ${
                        isOutOfStock
                          ? "border-border/60 bg-muted/40 text-muted-foreground/40 cursor-not-allowed line-through select-none"
                          : isSelected
                          ? "border-[#FF3154] bg-[#FF3154]/10 text-[#FF3154] ring-1 ring-[#FF3154] font-bold shadow-2xs cursor-pointer"
                          : "border-border bg-white hover:bg-muted/40 text-foreground cursor-pointer"
                      }`}
                      title={isOutOfStock ? `${size} is currently out of stock` : size}
                    >
                      {size}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-4 text-xs text-muted-foreground">
                  One Size / Standard Fit
                </div>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2 pt-1">
            <label
              htmlFor="product-quantity-input"
              className="text-xs font-semibold uppercase tracking-wider text-foreground block"
            >
              Quantity
            </label>
            <div className="inline-flex items-center border border-border rounded-xs bg-white h-11">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="w-10 h-full flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                id="product-quantity-input"
                type="number"
                min="1"
                max={selectedSizeStock}
                value={quantity}
                onChange={handleQuantityInputChange}
                aria-label="Product quantity"
                className="w-12 h-full text-center text-xs font-semibold text-foreground focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={handleIncrement}
                disabled={Boolean(selectedSize && quantity >= selectedSizeStock)}
                aria-label="Increase quantity"
                className="w-10 h-full flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Primary Add to Cart CTA */}
            <button
              type="button"
              disabled={Boolean(selectedSize) && selectedSizeStock <= 0}
              onClick={handleAddToCart}
              className="w-full h-12 bg-[#FF3154] hover:bg-[#FF3154]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#FFFFFF] text-xs font-semibold tracking-widest uppercase rounded-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF3154] focus-visible:ring-offset-2"
            >
              {selectedSize && selectedSizeStock <= 0 ? (
                <span>Out of Stock</span>
              ) : isAddedToBag ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Shopping Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            {/* Secondary CTA: Add to Wishlist */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="w-full h-12 border border-border bg-white hover:bg-muted/30 text-foreground text-xs font-semibold tracking-widest uppercase rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
            >
              <Heart
                className={`w-4 h-4 transition-colors duration-200 ${
                  isWishlisted
                    ? "fill-[#FF3154] text-[#FF3154]"
                    : "text-foreground/80"
                }`}
              />
              <span>{isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}</span>
            </button>
          </div>

          {/* Wishlist & Share Quick Row */}
          <div className="flex items-center justify-between pt-2 pb-4 border-b border-border/60 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isWishlisted ? "fill-[#FF3154] text-[#FF3154]" : ""
                }`}
              />
              <span>{isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Share article link"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Article</span>
            </button>
          </div>

          {/* Section 9: Clean Product Details Information (NO color, NO fabric) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground">
              Product Details
            </h3>

            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground block mb-0.5">
                  Description
                </span>
                <p className="leading-relaxed font-light whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {product.sizes && product.sizes.length > 0 && (
                <div className="pt-1">
                  <span className="font-semibold text-foreground block mb-0.5">
                    Available Sizes
                  </span>
                  <span className="font-mono text-[11px] tracking-wider uppercase">
                    {product.sizes.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Brand Guarantees / Shipping / Return Policy */}
          <div className="space-y-3 pt-6 border-t border-border/60">
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <Truck className="w-4 h-4 text-[#FF3154] shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block font-medium">
                  Nationwide & International Delivery
                </strong>
                <span>Express courier delivery across Pakistan within 3–5 business days. International delivery within 10 business days (charges based on package weight).</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-[#FF3154] shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block font-medium">
                  Premium Pakistani Fashion
                </strong>
                <span>Thoughtfully designed pieces made for modern Pakistani style.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <RotateCcw className="w-4 h-4 text-[#FF3154] shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block font-medium">
                  Hassle-Free Exchange Policy
                </strong>
                <span>Exchange available within 2 days for valid reasons on unused and unwashed articles.</span>
              </div>
            </div>
          </div>

          {/* Back to Shop Navigation Link */}
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Luxury Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />
    </div>
  );
}

export default ProductDetailView;
