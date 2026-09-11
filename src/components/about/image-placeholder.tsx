"use client";

import React from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

/**
 * EditorialImagePlaceholder
 * -------------------------------------------------------------
 * HOW TO USE WITH FINAL PHOTOGRAPHY:
 * Simply pass the `src` prop pointing to your image in /public
 * (e.g. src="/about-hero.jpg" or src="/editorial-lookbook.jpg").
 *
 * Until campaign photos are provided, this component renders a
 * minimalist, high-fashion editorial placeholder frame adhering to
 * Behruz Fashion House's strict monochrome + subtle pink palette.
 * -------------------------------------------------------------
 */
export interface ImagePlaceholderProps {
  src?: string;
  alt: string;
  aspectRatio?: string; // e.g. "aspect-[4/5]", "aspect-[16/9]", "aspect-[3/4]"
  label?: string;
  sublabel?: string;
  priority?: boolean;
  className?: string;
  overlayText?: string;
}

export function EditorialImagePlaceholder({
  src,
  alt,
  aspectRatio = "aspect-[4/5]",
  label = "Editorial Campaign Visual",
  sublabel = "Behruz Fashion House",
  priority = false,
  className = "",
}: ImagePlaceholderProps) {
  if (src) {
    return (
      <div
        className={`relative overflow-hidden bg-muted/30 border border-border ${aspectRatio} ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden bg-gradient-to-b from-muted/40 via-muted/20 to-muted/50 border border-border/80 flex flex-col items-center justify-center p-8 select-none group transition-colors duration-500 hover:border-primary/40 ${aspectRatio} ${className}`}
    >
      {/* Delicate inner border for editorial framing */}
      <div className="absolute inset-3 sm:inset-4 border border-border/60 pointer-events-none transition-colors duration-500 group-hover:border-primary/30" />

      {/* Subtle corner accents */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-3 h-[1px] bg-primary/40" />
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-[1px] h-3 bg-primary/40" />
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-3 h-[1px] bg-primary/40" />
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-[1px] h-3 bg-primary/40" />

      {/* Minimalist Camera Icon & Editorial Tag */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-border bg-background flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-105 shadow-xs">
          <Camera
            className="w-4 h-4 sm:w-5 sm:h-5 text-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-primary font-medium mb-1">
          {label}
        </span>
        <span className="font-serif italic text-sm sm:text-base text-foreground/80">
          {sublabel}
        </span>
        <p className="mt-3 text-[11px] text-muted-foreground/80 tracking-wide font-light">
          Replace with campaign photography
        </p>
      </div>
    </div>
  );
}

export default EditorialImagePlaceholder;
