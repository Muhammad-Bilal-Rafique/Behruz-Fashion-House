"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload,
  ImageIcon,
  X,
  PackagePlus,
  SlidersHorizontal,
  AlertCircle,
  Eye,
  Layers,
  Tag,
  ShoppingBag,
  ArrowLeft,
  RotateCcw,
  Loader2,
  Percent,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateDiscountPercentage } from "@/lib/utils";
import { compressImage } from "@/lib/image-compression";
import { safeParseApiResponse, getFriendlyErrorMessage } from "@/lib/api-helpers";

export interface ProductFormData {
  name: string;
  originalPrice: string;
  discountedPrice: string;
  fabric?: string;
  description: string;
  sizes: string[];
  status: "active" | "draft";
  isFeatured: boolean;
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
}

const AVAILABLE_SIZES = ["S", "M", "L", "XL"] as const;

export function AddProductForm() {
  const router = useRouter();

  // Local state for images & drag-drop
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sizeStockMap, setSizeStockMap] = useState<Record<string, number | string>>({
    S: 5,
    M: 5,
    L: 5,
    XL: 5,
  });

  // React Hook Form initialization
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      originalPrice: "",
      discountedPrice: "",
      fabric: "",
      description: "",
      sizes: [],
      status: "active",
      isFeatured: false,
    },
    mode: "onBlur",
  });

  // Watch values for live preview & calculations
  const watchedName = watch("name");
  const watchedOriginalPrice = watch("originalPrice");
  const watchedDiscountedPrice = watch("discountedPrice");
  const watchedFabric = watch("fabric");
  const watchedSizes = watch("sizes") || [];
  const watchedStatus = watch("status");
  const watchedIsFeatured = watch("isFeatured");

  const origPriceNum = Number(watchedOriginalPrice) || 0;
  const discPriceNum = Number(watchedDiscountedPrice) || 0;
  const currentDiscountPercent = calculateDiscountPercentage(origPriceNum, discPriceNum);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  // Handle size checkbox toggle
  const handleToggleSize = (size: string) => {
    const current = watchedSizes;
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    setValue("sizes", next, { shouldValidate: true, shouldDirty: true });
  };

  // Handle image files selection with automatic client-side compression
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    const rawFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported format (PNG, JPG, WEBP).`);
        return;
      }
      rawFiles.push(file);
    });

    if (rawFiles.length === 0) return;

    setIsCompressing(true);

    try {
      const compressedItems: UploadedImage[] = await Promise.all(
        rawFiles.map(async (file) => {
          // Compress large photos silently to max 1280px (shrinks 10MB -> ~140KB)
          const optimizedFile = await compressImage(file);
          const previewUrl = URL.createObjectURL(optimizedFile);
          return {
            id: `${optimizedFile.name}-${optimizedFile.lastModified}-${Math.random()}`,
            file: optimizedFile,
            previewUrl,
          };
        })
      );

      setImages((prev) => [...prev, ...compressedItems]);
      setImageError(null);
    } catch (err) {
      console.error("Image optimization error:", err);
      // Fallback: use original files
      const fallbackItems: UploadedImage[] = rawFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...fallbackItems]);
      setImageError(null);
    } finally {
      setIsCompressing(false);
    }
  };

  // Remove single image
  const handleRemoveImage = (idToRemove: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === idToRemove);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== idToRemove);
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Reset form and images
  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setImageError(null);
    reset();
    toast.info("Form reset to default values.");
  };

  // Form submission handler
  const onSubmit = async (data: ProductFormData) => {
    let hasCustomError = false;

    const origPrice = Number(data.originalPrice);
    const discPrice = Number(data.discountedPrice);

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

    if (!data.sizes || data.sizes.length === 0) {
      hasCustomError = true;
    }

    if (images.length === 0) {
      setImageError("Please upload at least one product image.");
      hasCustomError = true;
    }

    if (hasCustomError) {
      toast.error("Please fill in all required fields before proceeding.");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("originalPrice", String(origPrice));
      formData.append("discountedPrice", String(discPrice));
      formData.append("fabric", (data.fabric || "").trim());
      formData.append("description", data.description.trim());
      formData.append("sizes", JSON.stringify(data.sizes));

      // Append sizeStock
      const sizeStockArray = data.sizes.map((s) => ({
        size: s,
        stock: Math.max(0, Number(sizeStockMap[s] ?? 0)),
      }));
      formData.append("sizeStock", JSON.stringify(sizeStockArray));

      formData.append("status", data.status);
      formData.append("isFeatured", String(Boolean(data.isFeatured)));

      // Append already-optimized images directly for instant upload
      images.forEach((img) => {
        formData.append("images", img.file);
      });

      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });

      const { success, data: result, error } = await safeParseApiResponse(
        res,
        "Failed to create product. Please try again."
      );

      if (!success || !result?.success) {
        throw new Error(error || "Failed to create product.");
      }

      // Cleanup local preview URLs
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
      reset();
      setSizeStockMap({ S: 5, M: 5, L: 5, XL: 5 });

      toast.success("Product added successfully!", {
        description: `"${result.product.name}" is now saved in your catalogue.`,
        duration: 5000,
      });
    } catch (err: any) {
      console.error("Failed to add product:", err);
      const friendlyMessage = getFriendlyErrorMessage(
        err,
        "Failed to add product. Please try again."
      );
      toast.error(friendlyMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Top action / back row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Store Catalogue</span>
          </Link>
          <span className="text-muted-foreground/40 text-xs">/</span>
          <span className="text-xs uppercase tracking-wider font-semibold text-primary">
            New Article
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || isUploading || isCompressing}
            className="text-xs gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 shadow-xs"
          >
            {isCompressing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Shop...</span>
              </>
            ) : (
              <>
                <PackagePlus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid Layout: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1 — BASIC INFORMATION & PRICING */}
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                <Tag className="w-3.5 h-3.5" />
                <span>Section 1</span>
              </div>
              <CardTitle className="text-xl font-serif font-normal tracking-tight text-foreground">
                Basic Information & Pricing
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Enter product identification, original and selling price, and description.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 space-y-5">
              {/* Product Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="product-name">
                    Product Name <span className="text-primary">*</span>
                  </Label>
                  {errors.name && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name.message}
                    </span>
                  )}
                </div>
                <Input
                  id="product-name"
                  placeholder="e.g. Ayleen - Maroon"
                  {...register("name", {
                    required: "Product name is required.",
                    minLength: {
                      value: 3,
                      message: "Product name must be at least 3 characters.",
                    },
                  })}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Each product represents an individual article and color. You can include the color directly in the title.
                </p>
              </div>

              {/* Pricing Grid: Original Price & Discounted Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xs bg-muted/20 border border-border/80">
                {/* Original Price (PKR) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="original-price">
                      Original Price (PKR) <span className="text-primary">*</span>
                    </Label>
                    {errors.originalPrice && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.originalPrice.message}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground select-none">
                      PKR
                    </span>
                    <Input
                      id="original-price"
                      type="number"
                      min="1"
                      step="any"
                      placeholder="7500"
                      className={`pl-12 ${
                        errors.originalPrice ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      {...register("originalPrice", {
                        required: "Original price is required.",
                        min: {
                          value: 1,
                          message: "Original price must be greater than 0.",
                        },
                      })}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Standard list price before discount.</p>
                </div>

                {/* Discounted Price (PKR) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="discounted-price">
                      Discounted Price (PKR) <span className="text-primary">*</span>
                    </Label>
                    {errors.discountedPrice && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.discountedPrice.message}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground select-none">
                      PKR
                    </span>
                    <Input
                      id="discounted-price"
                      type="number"
                      min="1"
                      step="any"
                      placeholder="6000"
                      className={`pl-12 ${
                        errors.discountedPrice ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      {...register("discountedPrice", {
                        required: "Discounted price is required.",
                        min: {
                          value: 1,
                          message: "Discounted price must be greater than 0.",
                        },
                        validate: (val) => {
                          const orig = Number(watchedOriginalPrice);
                          const disc = Number(val);
                          if (orig && disc > orig) {
                            return "Discounted price cannot exceed original price.";
                          }
                          return true;
                        },
                      })}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Actual selling price. May equal original price for no discount.
                  </p>
                </div>

                {/* Discount Badge summary inside card if discount exists */}
                {currentDiscountPercent > 0 && (
                  <div className="sm:col-span-2 pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-primary font-medium">
                    <Percent className="w-3.5 h-3.5" />
                    <span>
                      Customers will see a <strong>{currentDiscountPercent}% OFF</strong> badge on this product.
                    </span>
                  </div>
                )}
              </div>

              {/* Fabric (Optional composition) */}
              <div className="space-y-1.5">
                <Label htmlFor="product-fabric">
                  Fabric Composition <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                </Label>
                <Input
                  id="product-fabric"
                  placeholder="e.g. Shamoz Silk, Chiffon, Lawn"
                  {...register("fabric")}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="product-description">
                    Description <span className="text-primary">*</span>
                  </Label>
                  {errors.description && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description.message}
                    </span>
                  )}
                </div>
                <Textarea
                  id="product-description"
                  rows={5}
                  placeholder="Describe the article, embroidery details, stitching, included pieces, and styling recommendations."
                  className={`leading-relaxed resize-y min-h-[120px] ${
                    errors.description ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  {...register("description", {
                    required: "Description is required.",
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — SIZES */}
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Section 2</span>
                  </div>
                  <CardTitle className="text-xl font-serif font-normal tracking-tight text-foreground">
                    Available Sizes
                  </CardTitle>
                </div>
                {errors.sizes && (
                  <span className="text-xs text-red-600 flex items-center gap-1 font-normal">
                    <AlertCircle className="w-3 h-3" />
                    {errors.sizes.message}
                  </span>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Select all sizes available for this article.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <Controller
                name="sizes"
                control={control}
                rules={{
                  validate: (v) =>
                    (v && v.length > 0) || "Please select at least one size.",
                }}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {AVAILABLE_SIZES.map((size) => {
                      const isChecked = field.value?.includes(size);
                      return (
                        <div
                          key={size}
                          onClick={() => handleToggleSize(size)}
                          className={`flex flex-col justify-between p-3.5 rounded-xs border cursor-pointer select-none transition-all duration-150 ${
                            isChecked
                              ? "border-primary bg-primary/[0.04] text-foreground shadow-2xs"
                              : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`size-${size}`}
                              checked={isChecked}
                              onCheckedChange={() => handleToggleSize(size)}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold tracking-wide text-foreground">
                                {size}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {size === "S"
                                  ? "Small"
                                  : size === "M"
                                  ? "Medium"
                                  : size === "L"
                                  ? "Large"
                                  : "Extra Large"}
                              </span>
                            </div>
                          </div>

                          {isChecked && (
                            <div
                              className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <label
                                htmlFor={`stock-${size}`}
                                className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold"
                              >
                                Stock:
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  id={`stock-${size}`}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  placeholder="0"
                                  value={
                                    sizeStockMap[size] !== undefined && sizeStockMap[size] !== null
                                      ? String(sizeStockMap[size])
                                      : ""
                                  }
                                  onFocus={(e) => {
                                    if (e.target.value === "0") {
                                      e.target.select();
                                    }
                                  }}
                                  onChange={(e) => {
                                    let raw = e.target.value.replace(/[^0-9]/g, "");
                                    // Strip leading zeros if followed by other digits (e.g. "025" -> "25")
                                    if (raw.length > 1 && raw.startsWith("0")) {
                                      raw = raw.replace(/^0+/, "") || "0";
                                    }
                                    setSizeStockMap((prev) => ({
                                      ...prev,
                                      [size]: raw,
                                    }));
                                  }}
                                  onBlur={() => {
                                    if (
                                      sizeStockMap[size] === "" ||
                                      sizeStockMap[size] === undefined ||
                                      sizeStockMap[size] === null
                                    ) {
                                      setSizeStockMap((prev) => ({
                                        ...prev,
                                        [size]: 0,
                                      }));
                                    }
                                  }}
                                  className="w-20 px-2 py-1 text-xs text-right font-medium rounded-xs border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                />
                                <span className="text-[10px] text-muted-foreground">pcs</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* SECTION 3 — PRODUCT IMAGES */}
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Section 3</span>
                  </div>
                  <CardTitle className="text-xl font-serif font-normal tracking-tight text-foreground">
                    Product Images
                  </CardTitle>
                </div>
                {imageError && (
                  <span className="text-xs text-red-600 flex items-center gap-1 font-normal">
                    <AlertCircle className="w-3 h-3" />
                    {imageError}
                  </span>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Upload photos for this article. All uploaded images belong specifically to this product.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 space-y-6">
              {/* Drag-and-Drop Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xs p-8 text-center cursor-pointer transition-all duration-200 group ${
                  isDragging
                    ? "border-primary bg-primary/[0.03] scale-[1.005]"
                    : "border-border hover:border-primary/50 bg-muted/10 hover:bg-muted/25"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />

                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                  <Upload className="w-5 h-5" />
                </div>

                <p className="text-sm font-semibold text-foreground tracking-tight mb-1">
                  Upload Product Images
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Drag and drop images here, or click to browse
                </p>
                <div className="inline-flex items-center gap-2 text-[11px] text-muted-foreground/80 tracking-wider uppercase font-mono bg-muted px-2.5 py-1 rounded-xs border border-border">
                  PNG, JPG or WEBP
                </div>
              </div>

              {/* Previews Grid */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Selected Photos ({images.length})
                    </span>
                    <span className="text-[11px] text-muted-foreground italic">
                      First image serves as the storefront cover
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {images.map((img, index) => (
                        <motion.div
                          key={img.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          className="relative group rounded-xs overflow-hidden border border-border bg-muted/30 aspect-[3/4] flex flex-col justify-between p-2 shadow-2xs"
                        >
                          <img
                            src={img.previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                          />

                          {/* Top Badge: Cover indicator or Number */}
                          <div className="relative z-10 flex items-center justify-between w-full">
                            {index === 0 ? (
                              <span className="bg-primary text-primary-foreground text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-xs">
                                Cover
                              </span>
                            ) : (
                              <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-xs">
                                #{index + 1}
                              </span>
                            )}

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(img.id);
                              }}
                              className="w-6 h-6 rounded-full bg-white/90 text-foreground hover:bg-red-600 hover:text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span className="sr-only">Remove photo</span>
                            </button>
                          </div>

                          {/* Bottom filename badge */}
                          <div className="relative z-10 mt-auto bg-black/70 backdrop-blur-xs text-[10px] text-white/90 px-1.5 py-1 rounded-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {img.file.name}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status, Live Preview & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* SECTION 4 — PRODUCT STATUS & VISIBILITY */}
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Section 4</span>
              </div>
              <CardTitle className="text-lg font-serif font-normal tracking-tight text-foreground">
                Product Status
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 space-y-4">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Active Option */}
                    <button
                      type="button"
                      onClick={() => field.onChange("active")}
                      className={`flex flex-col items-start p-3.5 rounded-xs border text-left cursor-pointer transition-all duration-150 ${
                        field.value === "active"
                          ? "border-primary bg-primary/[0.04] text-foreground ring-1 ring-primary"
                          : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                          Active
                        </span>
                        {field.value === "active" && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground leading-tight">
                        Live on storefront
                      </span>
                    </button>

                    {/* Draft Option */}
                    <button
                      type="button"
                      onClick={() => field.onChange("draft")}
                      className={`flex flex-col items-start p-3.5 rounded-xs border text-left cursor-pointer transition-all duration-150 ${
                        field.value === "draft"
                          ? "border-primary bg-primary/[0.04] text-foreground ring-1 ring-primary"
                          : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                          Draft
                        </span>
                        {field.value === "draft" && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground leading-tight">
                        Hidden from shop
                      </span>
                    </button>
                  </div>
                )}
              />

              <p className="text-xs text-muted-foreground leading-relaxed">
                Active products appear publicly in the Shop. Draft products remain strictly hidden.
              </p>

              <Separator />

              {/* Featured Checkbox */}
              <div className="pt-1">
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <div
                      onClick={() => field.onChange(!field.value)}
                      className={`flex items-start gap-3 p-3.5 rounded-xs border cursor-pointer select-none transition-all duration-150 ${
                        field.value
                          ? "border-primary bg-primary/[0.04] text-foreground ring-1 ring-primary/60 shadow-2xs"
                          : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Checkbox
                        id="is-featured"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold tracking-wide text-foreground">
                            Featured Product
                          </span>
                          {field.value && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-xs">
                              Featured
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          Spotlight this article on the homepage and featured filter.
                        </span>
                      </div>
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* LIVE STOREFRONT PREVIEW CARD */}
          <Card className="border border-border bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>Storefront Card Preview</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {watchedIsFeatured && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Featured
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      watchedStatus === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {watchedStatus === "active" ? "Active" : "Draft"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Product Cover Image Simulation */}
              <div className="relative aspect-[3/4] w-full rounded-xs bg-muted/40 overflow-hidden border border-border/80 flex items-center justify-center group">
                {images.length > 0 ? (
                  <img
                    src={images[0].previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground/60">
                    <ShoppingBag className="w-10 h-10 stroke-[1.2] mb-2 text-muted-foreground/40" />
                    <span className="text-xs font-serif tracking-widest uppercase text-muted-foreground/80">
                      Behruz Fashion House
                    </span>
                    <span className="text-[11px] text-muted-foreground/60 mt-1">
                      Cover image will appear here
                    </span>
                  </div>
                )}

                {/* Top-Left Discount Badge */}
                {currentDiscountPercent > 0 && (
                  <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-[#FF3154] text-white rounded-xs shadow-xs pointer-events-none">
                    {currentDiscountPercent}% OFF
                  </span>
                )}

                {/* Fabric tag overlay if present */}
                {watchedFabric && (
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs">
                    {watchedFabric}
                  </div>
                )}
              </div>

              {/* Product Info Simulation */}
              <div className="space-y-2">
                <h4 className="font-serif text-base text-foreground font-normal tracking-tight line-clamp-1">
                  {watchedName || "Product Name Preview"}
                </h4>

                {/* Pricing row */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  {discPriceNum > 0 ? (
                    <span className="font-bold text-foreground text-sm sm:text-base">
                      PKR {discPriceNum.toLocaleString()}
                    </span>
                  ) : (
                    <span className="font-semibold text-muted-foreground text-sm">
                      PKR —
                    </span>
                  )}

                  {origPriceNum > discPriceNum && (
                    <span className="line-through text-xs text-muted-foreground">
                      PKR {origPriceNum.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Sizes pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-1">
                    Sizes:
                  </span>
                  {watchedSizes.length > 0 ? (
                    watchedSizes.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-semibold border border-border px-1.5 py-0.5 rounded-xs bg-background text-foreground flex items-center gap-1"
                      >
                        <span>{s}</span>
                        <span className="text-[9px] text-muted-foreground">({sizeStockMap[s] ?? 0})</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground/60 italic">
                      None selected
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 5 — FORM ACTIONS */}
          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-6 space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting || isUploading || isCompressing}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium tracking-wide shadow-xs gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Photos...</span>
                  </>
                ) : isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Product to Shop...</span>
                  </>
                ) : (
                  <>
                    <PackagePlus className="w-4 h-4" />
                    <span>Add Product</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/shop")}
                className="w-full h-10 border-border text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                Cancel
              </Button>

              <p className="text-[11px] text-center text-muted-foreground pt-1">
                Articles will appear in the customer shop catalogue.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

export default AddProductForm;
