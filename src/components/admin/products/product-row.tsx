"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit,
  Share2,
  Trash2,
  Star,
  Package,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { calculateDiscountPercentage } from "@/lib/utils";
import { DeleteProductDialog } from "./delete-product-dialog";
import {
  deleteProductAction,
  toggleProductStatusAction,
  toggleProductFeaturedAction,
} from "@/app/admin/products/actions";

export interface SerializedProduct {
  _id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  description: string;
  fabric?: string;
  sizes: string[];
  sizeStock?: { size: string; stock: number }[];
  images: { url: string; publicId: string; isCover: boolean }[];
  status: "active" | "draft";
  isFeatured: boolean;
  createdAt: string;
}

interface ProductRowProps {
  product: SerializedProduct;
}

export function ProductRow({ product }: ProductRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Optimistic / Local interactive states
  const [currentStatus, setCurrentStatus] = useState<"active" | "draft">(product.status);
  const [currentFeatured, setCurrentFeatured] = useState<boolean>(product.isFeatured);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cover image fallback logic
  const coverImage =
    product.images?.find((img) => img.isCover)?.url ||
    product.images?.[0]?.url ||
    null;

  // Price & Discount calculations
  const originalPrice = Number(product.originalPrice || 0);
  const discountedPrice = Number(product.discountedPrice || originalPrice);
  const hasDiscount = originalPrice > discountedPrice && originalPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  // Stock calculations
  const sizeStockList = product.sizeStock && product.sizeStock.length > 0
    ? product.sizeStock
    : product.sizes.map((s) => ({ size: s, stock: 0 }));

  const totalStock = sizeStockList.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
  const isOutOfStock = totalStock === 0;

  // 1. Action: Share / Copy Article Public URL
  const handleShare = async () => {
    try {
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "";
      const publicUrl = `${origin}/products/${product._id}`;

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
        toast.success("Article link copied!", {
          description: "Ready to paste into Instagram, captions, or messages.",
        });
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = publicUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        toast.success("Article link copied!");
      }
    } catch (err) {
      console.error("Failed to copy link to clipboard:", err);
      toast.error("Failed to copy link. Please try copying manually.");
    }
  };

  // 2. Action: Toggle Status (Active ↔ Draft)
  const handleToggleStatus = async () => {
    const nextStatus = currentStatus === "active" ? "draft" : "active";
    setCurrentStatus(nextStatus);

    startTransition(async () => {
      try {
        const res = await toggleProductStatusAction(product._id, nextStatus);
        if (res.success) {
          if (nextStatus === "active") {
            toast.success("Product is now Active.", {
              description: `"${product.name}" is now live on the store catalogue.`,
            });
          } else {
            toast.info("Product moved to Draft.", {
              description: `"${product.name}" is hidden from customers.`,
            });
          }
          router.refresh();
        } else {
          // Rollback
          setCurrentStatus(currentStatus);
          toast.error(res.error || "Failed to update product status.");
        }
      } catch (err) {
        // Rollback
        setCurrentStatus(currentStatus);
        console.error("Status toggle error:", err);
        toast.error("Network error updating status.");
      }
    });
  };

  // 3. Action: Toggle Featured
  const handleToggleFeatured = async () => {
    const nextFeatured = !currentFeatured;
    setCurrentFeatured(nextFeatured);

    startTransition(async () => {
      try {
        const res = await toggleProductFeaturedAction(product._id, nextFeatured);
        if (res.success) {
          if (nextFeatured) {
            toast.success("Marked as Featured!", {
              description: `"${product.name}" will appear in homepage highlights.`,
            });
          } else {
            toast.info("Removed from Featured.", {
              description: `"${product.name}" is no longer featured on the homepage.`,
            });
          }
          router.refresh();
        } else {
          // Rollback
          setCurrentFeatured(currentFeatured);
          toast.error(res.error || "Failed to update featured status.");
        }
      } catch (err) {
        // Rollback
        setCurrentFeatured(currentFeatured);
        console.error("Featured toggle error:", err);
        toast.error("Network error updating featured status.");
      }
    });
  };

  // 4. Action: Delete Confirmation Handler
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteProductAction(product._id);

      if (res.success) {
        toast.success("Product deleted successfully.", {
          description: `"${product.name}" and its photos have been removed.`,
        });
        setIsDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete product. Please try again.");
      }
    } catch (err) {
      console.error("Delete product error:", err);
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group bg-card border border-border rounded-xs p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left & Center Information */}
        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
          {/* Cover Image */}
          <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xs overflow-hidden bg-muted shrink-0 border border-border/80">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 bg-muted/60">
                <Package className="w-6 h-6 stroke-[1.5]" />
                <span className="text-[9px] uppercase tracking-wider mt-1">No Image</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-2 flex-1 min-w-0">
            {/* Title & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/products/${product._id}/edit`}
                className="font-serif text-base sm:text-lg font-normal text-foreground hover:text-primary transition-colors truncate max-w-sm sm:max-w-md"
                title={product.name}
              >
                {product.name}
              </Link>

              {/* Status Badge & Inline Toggle */}
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={isPending}
                title={`Click to set as ${currentStatus === "active" ? "Draft" : "Active"}`}
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full cursor-pointer transition-all border ${
                  currentStatus === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                }`}
              >
                {currentStatus === "active" ? (
                  <>
                    <Eye className="w-2.5 h-2.5" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-2.5 h-2.5" />
                    <span>Draft</span>
                  </>
                )}
              </button>

              {/* Featured Badge & Inline Toggle */}
              <button
                type="button"
                onClick={handleToggleFeatured}
                disabled={isPending}
                title={currentFeatured ? "Remove from Featured" : "Promote to Featured"}
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full cursor-pointer transition-all border ${
                  currentFeatured
                    ? "bg-primary/10 text-primary border-primary/25 hover:bg-primary/20"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <Star
                  className={`w-2.5 h-2.5 ${
                    currentFeatured ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
                <span>{currentFeatured ? "Featured" : "Feature"}</span>
              </button>
            </div>

            {/* Sizes & Stock Details */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {sizeStockList.map((st) => (
                  <span
                    key={st.size}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-muted/70 text-[11px] font-mono border border-border/80 text-foreground"
                  >
                    <span className="font-semibold">{st.size}</span>
                    <span className="text-muted-foreground font-normal">({st.stock})</span>
                  </span>
                ))}
              </div>

              {/* Total Stock Indicator */}
              <span
                className={`text-[11px] font-medium ${
                  isOutOfStock ? "text-red-600 font-semibold" : "text-muted-foreground"
                }`}
              >
                Total Stock:{" "}
                <strong className={isOutOfStock ? "text-red-600" : "text-foreground"}>
                  {totalStock}
                </strong>
                {isOutOfStock && (
                  <span className="ml-1 text-[10px] uppercase font-bold text-red-600 tracking-wider">
                    (Out of Stock)
                  </span>
                )}
              </span>
            </div>

            {/* Pricing Section (Mobile: visible here) */}
            <div className="flex items-baseline gap-2 md:hidden pt-1">
              {hasDiscount ? (
                <>
                  <span className="font-sans text-sm font-bold text-foreground tabular-nums">
                    PKR {discountedPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground line-through tabular-nums">
                    PKR {originalPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {discountPercent}% OFF
                  </span>
                </>
              ) : (
                <span className="font-sans text-sm font-bold text-foreground tabular-nums">
                  PKR {discountedPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Section (Desktop / Tablet) */}
        <div className="hidden md:flex flex-col items-end shrink-0 text-right min-w-[150px]">
          {hasDiscount ? (
            <div className="space-y-0.5">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-xs text-muted-foreground line-through tabular-nums">
                  PKR {originalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  {discountPercent}% OFF
                </span>
              </div>
              <div className="font-sans text-base font-bold text-foreground tabular-nums">
                PKR {discountedPrice.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="font-sans text-base font-bold text-foreground tabular-nums">
              PKR {discountedPrice.toLocaleString()}
            </div>
          )}
        </div>

        {/* Actions Button Row */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-border/60">
          {/* Edit Button */}
          <Link href={`/admin/products/${product._id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs gap-1.5 rounded-xs border-border hover:border-primary/50 text-foreground"
              aria-label={`Edit ${product.name}`}
            >
              <Edit className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Edit</span>
            </Button>
          </Link>

          {/* Share Button (Public link copy) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-8 px-2.5 text-xs gap-1.5 rounded-xs border-border hover:border-primary/50 text-foreground"
            title="Copy article link to clipboard"
            aria-label={`Share link for ${product.name}`}
          >
            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          {/* Delete Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-8 px-2.5 text-xs gap-1.5 rounded-xs border-border hover:border-red-300 hover:bg-red-50 text-red-600"
            aria-label={`Delete ${product.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      {/* Accessible Confirmation Modal for Deletion */}
      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        productName={product.name}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}
