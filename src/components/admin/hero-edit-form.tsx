"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Upload,
  ImageIcon,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HeroFormValues {
  heading: string;
  description: string;
  buttonText: string;
  button2Text: string;
}

interface HeroData extends HeroFormValues {
  imageUrl: string;
  imagePublicId?: string;
}

export function HeroEditForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentHero, setCurrentHero] = useState<HeroData | null>(null);

  // New image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<HeroFormValues>({
    defaultValues: {
      heading: "",
      description: "",
      buttonText: "",
      button2Text: "",
    },
  });

  const watchButtonText = watch("buttonText");
  const watchButton2Text = watch("button2Text");

  // Fetch current Hero data on mount
  useEffect(() => {
    async function fetchHero() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/hero");
        const data = await res.json();

        if (data.success && data.hero) {
          setCurrentHero(data.hero);
          reset({
            heading: data.hero.heading || "",
            description: data.hero.description || "",
            buttonText: data.hero.buttonText || "Shop Collection",
            button2Text: data.hero.button2Text || "Explore New Arrivals",
          });
        } else {
          toast.error(data.error || "Failed to load hero content");
        }
      } catch (err) {
        console.error("Failed to load hero content:", err);
        toast.error("Could not reach server to load hero data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHero();
  }, [reset]);

  // Clean up object URLs when previewUrl changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // Validate file type
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/jpg",
    ];
    if (!validMimeTypes.includes(file.type)) {
      setFileError(
        "Invalid file format. Please choose a JPG, PNG, WEBP, or AVIF image."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file size (max 5MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setFileError(
        `File size exceeds 5MB (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller image.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Remove the newly selected preview and restore current hero image
  const handleCancelNewImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const onSubmit = async (values: HeroFormValues) => {
    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("heading", values.heading.trim());
      formData.append("description", values.description.trim());
      formData.append("buttonText", values.buttonText.trim());
      formData.append("button2Text", values.button2Text.trim());

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update hero section");
      }

      // Update state with newly saved hero data
      setCurrentHero(result.hero);
      reset({
        heading: result.hero.heading,
        description: result.hero.description,
        buttonText: result.hero.buttonText,
        button2Text: result.hero.button2Text,
      });

      // Clear new image selection
      handleCancelNewImage();

      toast.success("Hero section updated successfully!", {
        description: "Your homepage hero banner and content are now updated.",
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Save failed", {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-border/70 shadow-xs">
        <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs tracking-wider uppercase text-muted-foreground font-medium">
            Loading Hero Configuration...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border border-border/80 bg-background shadow-xs overflow-hidden">
        {/* Card Header */}
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Homepage Section
                </span>
              </div>
              <CardTitle className="text-xl font-serif">Hero Section</CardTitle>
              <CardDescription className="mt-1">
                Customize the main banner headline, description, action buttons, and hero image.
              </CardDescription>
            </div>

            {currentHero?.imagePublicId && (
              <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-xs border border-border">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Image Active</span>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* LEFT COLUMN: Text Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="heading">Hero Heading</Label>
                  <span className="text-[11px] text-muted-foreground">Required</span>
                </div>
                <Input
                  id="heading"
                  placeholder="e.g. Elegance, Redefined."
                  {...register("heading", {
                    required: "Hero heading is required",
                    minLength: {
                      value: 3,
                      message: "Heading must be at least 3 characters",
                    },
                  })}
                  className={errors.heading ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.heading && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.heading.message}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  The primary editorial title displayed in high-contrast luxury serif font.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Hero Description</Label>
                  <span className="text-[11px] text-muted-foreground">Required</span>
                </div>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="e.g. Timeless Pakistani fashion crafted for every occasion."
                  {...register("description", {
                    required: "Hero description is required",
                    minLength: {
                      value: 5,
                      message: "Description must be at least 5 characters",
                    },
                  })}
                  className={errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.description.message}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Sub-headline giving context to your brand&apos;s craftsmanship and collection.
                </p>
              </div>

              <Separator />

              {/* Call to Action Buttons Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="buttonText">Button 1 Text</Label>
                    <span className="text-[11px] text-muted-foreground">Required</span>
                  </div>
                  <Input
                    id="buttonText"
                    placeholder="e.g. Shop Collection"
                    {...register("buttonText", {
                      required: "Button 1 text is required",
                    })}
                    className={errors.buttonText ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.buttonText && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.buttonText.message}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Primary CTA button label
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="button2Text">Button 2 Text</Label>
                    <span className="text-[11px] text-muted-foreground">Optional</span>
                  </div>
                  <Input
                    id="button2Text"
                    placeholder="e.g. Explore New Arrivals"
                    {...register("button2Text")}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Secondary outline button label
                  </p>
                </div>
              </div>

              {/* Live Preview Card for both buttons */}
              <div className="p-4 rounded-xs border border-border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Buttons Live Preview
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* Button 1 preview */}
                  <div className="inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium bg-primary text-primary-foreground shadow-xs">
                    <span>{watchButtonText || "Shop Collection"}</span>
                    <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </div>

                  {/* Button 2 preview */}
                  <div className="inline-flex items-center justify-center px-5 py-3 text-xs uppercase tracking-[0.2em] font-medium text-foreground border border-border bg-background">
                    <span>{watchButton2Text || "Explore New Arrivals"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Image Management (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <Label className="block mb-2">Hero Image</Label>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  The primary full-width widescreen background banner for the homepage.
                  Recommended aspect ratio: <strong>16:9</strong>, max <strong>5MB</strong>.
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* File validation error alert */}
              {fileError && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>Image Error</AlertTitle>
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              )}

              {/* Image Previews Section */}
              <div className="grid grid-cols-1 gap-4">
                {/* 1. CURRENT SAVED IMAGE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Current Hero Image
                    </span>
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-xs">
                      Live
                    </span>
                  </div>

                  <div className="relative w-full aspect-[16/9] rounded-xs overflow-hidden border border-border bg-muted group shadow-xs">
                    {currentHero?.imageUrl ? (
                      <Image
                        src={currentHero.imageUrl}
                        alt="Current Hero Image"
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 100vw, 550px"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs">No image currently set</span>
                      </div>
                    )}

                    {currentHero?.imagePublicId && (
                      <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white p-1.5 text-[10px] truncate rounded-xs pointer-events-none">
                        Current Storefront Banner
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. PENDING NEW IMAGE PREVIEW */}
                {previewUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>New Selected Image</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelNewImage}
                        className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-medium cursor-pointer"
                        title="Remove selection"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>

                    <div className="relative w-full aspect-[16/9] rounded-xs overflow-hidden border-2 border-primary/60 bg-muted shadow-sm">
                      <Image
                        src={previewUrl}
                        alt="New Hero Preview"
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 100vw, 550px"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-semibold uppercase px-2 py-0.5 tracking-wider shadow-xs rounded-xs">
                        Pending Save
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-white p-1.5 text-[10px] rounded-xs">
                        {selectedFile?.name} ({(selectedFile ? selectedFile.size / 1024 : 0).toFixed(0)} KB)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload New Image Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 h-11 border-dashed border-2 hover:border-primary hover:bg-secondary/40 transition-colors"
                >
                  <Upload className="w-4 h-4 text-primary" />
                  <span>{selectedFile ? "Replace Selected Image" : "Upload New Image"}</span>
                </Button>
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  JPG, PNG, WEBP, or AVIF up to 5MB.
                </p>
              </div>

              {/* Image Optimization Notice */}
              <div className="rounded-xs border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-foreground text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Automatic Image Optimization</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  When you upload a new image, it is automatically formatted and
                  optimized for high-resolution display on both mobile and desktop devices.
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Card Footer Actions */}
        <CardFooter className="bg-muted/20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            {selectedFile ? (
              <span className="text-primary font-medium">
                1 new image ready to upload on save.
              </span>
            ) : isDirty ? (
              <span>Unsaved changes detected.</span>
            ) : (
              <span>All changes are up to date.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {selectedFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelNewImage}
                disabled={isSaving}
              >
                Discard Image
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
