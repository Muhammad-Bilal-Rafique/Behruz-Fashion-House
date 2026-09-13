"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Package,
  RotateCcw,
  Sparkles,
  Percent,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculateDiscountPercentage } from "@/lib/utils";
import type { SerializedProduct } from "./product-row";

interface EditProductFormProps {
  product: SerializedProduct;
}

interface EditFormData {
  name: string;
  originalPrice: string;
  discountedPrice: string;
  description: string;
  sizes: string[];
  status: "active" | "draft";
  isFeatured: boolean;
}

const AVAILABLE_SIZES = ["S", "M", "L", "XL"] as const;

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize sizeStock map
  const initialStockMap: Record<string, number> = {};
  AVAILABLE_SIZES.forEach((size) => {
    const existing = product.sizeStock?.find((st) => st.size === size);
    initialStockMap[size] = existing ? existing.stock : 10;
  });

  const [sizeStockMap, setSizeStockMap] = useState<Record<string, number>>(initialStockMap);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditFormData>({
    defaultValues: {
      name: product.name,
      originalPrice: String(product.originalPrice),
      discountedPrice: String(product.discountedPrice),
      description: product.description,
      sizes: product.sizes,
      status: product.status,
      isFeatured: product.isFeatured,
    },
  });

  const watchedName = watch("name");
  const watchedOriginalPrice = watch("originalPrice");
  const watchedDiscountedPrice = watch("discountedPrice");
  const watchedSizes = watch("sizes") || [];
  const watchedStatus = watch("status");
  const watchedIsFeatured = watch("isFeatured");

  const origPriceNum = Number(watchedOriginalPrice) || 0;
  const discPriceNum = Number(watchedDiscountedPrice) || 0;
  const currentDiscountPercent = calculateDiscountPercentage(origPriceNum, discPriceNum);

  const handleToggleSize = (size: string) => {
    const current = watchedSizes;
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    setValue("sizes", next, { shouldDirty: true });
  };

  const handleStockChange = (size: string, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setSizeStockMap((prev) => ({ ...prev, [size]: num }));
  };

  const onSubmit = async (data: EditFormData) => {
    const origPrice = Number(data.originalPrice);
    const discPrice = Number(data.discountedPrice);

    if (!data.name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (isNaN(origPrice) || origPrice <= 0) {
      toast.error("Please enter a valid positive original price.");
      return;
    }

    if (isNaN(discPrice) || discPrice <= 0) {
      toast.error("Please enter a valid positive discounted price.");
      return;
    }

    if (discPrice > origPrice) {
      toast.error("Discounted price cannot be greater than original price.");
      return;
    }

    if (!data.description.trim()) {
      toast.error("Product description is required.");
      return;
    }

    if (!data.sizes || data.sizes.length === 0) {
      toast.error("Please select at least one size.");
      return;
    }

    try {
      setIsSubmitting(true);

      const sizeStockArray = data.sizes.map((s) => ({
        size: s,
        stock: sizeStockMap[s] ?? 0,
      }));

      const payload = {
        name: data.name.trim(),
        originalPrice: origPrice,
        discountedPrice: discPrice,
        description: data.description.trim(),
        sizes: data.sizes,
        sizeStock: sizeStockArray,
        status: data.status,
        isFeatured: Boolean(data.isFeatured),
      };

      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update product.");
      }

      toast.success("Product updated successfully!", {
        description: `"${payload.name}" has been updated.`,
      });

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to update product:", err);
      toast.error(err.message || "Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Products</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/admin/products">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-9 rounded-xs"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-xs h-9 px-4 rounded-xs font-semibold gap-1.5 shadow-xs"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSubmitting ? "Saving Changes..." : "Save Changes"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <Card className="rounded-xs border-border shadow-2xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">General Information</CardTitle>
              <CardDescription className="text-xs">
                Product title and customer-facing description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                  Product Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name", { required: "Product name is required" })}
                  placeholder="e.g. Maria Lawn Luxury Stitched"
                  className="rounded-xs text-xs h-9"
                />
              </div>

              {/* Product Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-foreground">
                  Description <span className="text-primary">*</span>
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  {...register("description", { required: "Description is required" })}
                  placeholder="Detailed description of embroidery, cut, design details..."
                  className="rounded-xs text-xs leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Discounts Card */}
          <Card className="rounded-xs border-border shadow-2xs">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Pricing & Discounts</CardTitle>
                  <CardDescription className="text-xs">
                    Original and selling price in PKR
                  </CardDescription>
                </div>
                {currentDiscountPercent > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    <Percent className="w-3 h-3" />
                    {currentDiscountPercent}% OFF applied
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original Price */}
                <div className="space-y-1.5">
                  <Label htmlFor="originalPrice" className="text-xs font-semibold text-foreground">
                    Original Price (PKR) <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="1"
                    {...register("originalPrice", { required: true })}
                    placeholder="e.g. 6000"
                    className="rounded-xs text-xs h-9 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">Original list price before discount</p>
                </div>

                {/* Discounted Price */}
                <div className="space-y-1.5">
                  <Label htmlFor="discountedPrice" className="text-xs font-semibold text-foreground">
                    Selling / Discounted Price (PKR) <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    min="1"
                    {...register("discountedPrice", { required: true })}
                    placeholder="e.g. 4800"
                    className="rounded-xs text-xs h-9 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">Price charged at checkout</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sizes & Inventory Stock Card */}
          <Card className="rounded-xs border-border shadow-2xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Sizes & Inventory Stock</CardTitle>
              <CardDescription className="text-xs">
                Select available sizes and assign stock units for each
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Size Selectors */}
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((size) => {
                  const isSelected = watchedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleToggleSize(size)}
                      className={`px-4 py-2 text-xs font-mono font-bold rounded-xs border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                          : "bg-background text-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Per-size stock input table */}
              {watchedSizes.length > 0 && (
                <div className="pt-2 space-y-2">
                  <Label className="text-xs font-semibold text-foreground block">
                    Stock count per size:
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {watchedSizes.map((size) => (
                      <div
                        key={`stock-${size}`}
                        className="p-2.5 bg-muted/40 rounded-xs border border-border space-y-1"
                      >
                        <span className="text-xs font-mono font-bold text-foreground">
                          Size {size}
                        </span>
                        <Input
                          type="number"
                          min="0"
                          value={sizeStockMap[size] ?? 0}
                          onChange={(e) => handleStockChange(size, e.target.value)}
                          className="rounded-xs text-xs h-8 font-mono bg-background"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Status, Featured & Image Preview */}
        <div className="space-y-6">
          {/* Status & Visibility Card */}
          <Card className="rounded-xs border-border shadow-2xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Status & Visibility</CardTitle>
              <CardDescription className="text-xs">
                Publish status and storefront highlighting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Radio / Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Product Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue("status", "active", { shouldDirty: true })}
                    className={`p-2.5 rounded-xs border text-left text-xs transition-all cursor-pointer ${
                      watchedStatus === "active"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold shadow-2xs"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Active</span>
                      {watchedStatus === "active" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 font-normal">
                      Publicly visible
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue("status", "draft", { shouldDirty: true })}
                    className={`p-2.5 rounded-xs border text-left text-xs transition-all cursor-pointer ${
                      watchedStatus === "draft"
                        ? "border-amber-500 bg-amber-50/50 text-amber-950 font-semibold shadow-2xs"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Draft</span>
                      {watchedStatus === "draft" && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 font-normal">
                      Hidden from shop
                    </span>
                  </button>
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="pt-2 border-t border-border">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedIsFeatured}
                    onChange={(e) => setValue("isFeatured", e.target.checked, { shouldDirty: true })}
                    className="rounded-xs text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Feature on Homepage
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Display in homepage featured collection
                    </span>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Existing Product Images Card */}
          <Card className="rounded-xs border-border shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Product Images</CardTitle>
              <CardDescription className="text-xs">
                Current photographs stored in Cloudinary
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {product.images.map((img, idx) => (
                    <div
                      key={img.publicId || `img-${idx}`}
                      className="relative aspect-3/4 rounded-xs overflow-hidden bg-muted border border-border"
                    >
                      <Image
                        src={img.url}
                        alt={`Product image ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 120px, 150px"
                        className="object-cover"
                      />
                      {img.isCover && (
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider bg-black/75 text-white px-1.5 py-0.5 rounded-xs">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No images attached
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
