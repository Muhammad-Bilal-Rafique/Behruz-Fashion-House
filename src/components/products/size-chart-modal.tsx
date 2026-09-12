"use client";

import React, { useEffect } from "react";
import { X, Ruler, Sparkles } from "lucide-react";

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIZE_DATA = [
  { size: "Small", chest: "19", waist: "18", hips: "21" },
  { size: "Medium", chest: "21", waist: "20", hips: "22" },
  { size: "Large", chest: "23", waist: "22", hips: "24" },
  { size: "XLarge", chest: "25", waist: "23", hips: "26" },
];

export function SizeChartModal({ isOpen, onClose }: SizeChartModalProps) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-chart-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content (Matches Behruz Fashion House Clean White & Rose Palette) */}
      <div className="relative w-full max-w-lg bg-background text-foreground border border-border rounded-xs shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Rose Accent Bar */}
        <div className="h-1 w-full bg-[#FF3154]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close size chart"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xs p-1.5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-[#FF3154] font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Behruz Fashion House</span>
            <Sparkles className="w-3 h-3" />
          </div>
          <h2
            id="size-chart-title"
            className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-foreground"
          >
            Size Guide & Measurements
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground font-light max-w-sm mx-auto leading-relaxed">
            Stitched garment dimensions in <strong>inches</strong> (measured flat). Tailored for standard Pakistani pret & couture silhouettes.
          </p>
        </div>

        {/* Table Container */}
        <div className="px-6 py-2 sm:px-8">
          <div className="overflow-hidden rounded-xs border border-border bg-card shadow-2xs">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-secondary/60 border-b border-border text-foreground">
                  <th className="py-3 px-4 font-serif text-xs sm:text-sm font-semibold tracking-wider uppercase border-r border-border">
                    Size
                  </th>
                  <th className="py-3 px-4 font-serif text-xs sm:text-sm font-semibold tracking-wider uppercase border-r border-border">
                    Chest <span className="text-[10px] font-sans font-normal text-muted-foreground"></span>
                  </th>
                  <th className="py-3 px-4 font-serif text-xs sm:text-sm font-semibold tracking-wider uppercase border-r border-border">
                    Waist <span className="text-[10px] font-sans font-normal text-muted-foreground"></span>
                  </th>
                  <th className="py-3 px-4 font-serif text-xs sm:text-sm font-semibold tracking-wider uppercase">
                    Hip <span className="text-[10px] font-sans font-normal text-muted-foreground"></span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {SIZE_DATA.map((row, index) => (
                  <tr
                    key={row.size}
                    className={`transition-colors hover:bg-muted/40 ${
                      index % 2 === 1 ? "bg-muted/15" : "bg-background"
                    }`}
                  >
                    <td className="py-3.5 px-4 font-serif text-sm font-medium text-foreground border-r border-border">
                      {row.size}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-foreground border-r border-border">
                      {row.chest}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-foreground border-r border-border">
                      {row.waist}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-foreground">
                      {row.hips}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ethical, Modest Garment Measurement Guide */}
        <div className="px-6 py-4 sm:px-8 text-xs text-muted-foreground space-y-2 border-t border-border mt-4 bg-muted/20">
          <div className="flex items-center gap-1.5 text-foreground font-semibold tracking-wider uppercase text-[11px]">
            <Ruler className="w-3.5 h-3.5 text-[#FF3154]" />
            <span>Garment Sizing Guidelines</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="font-semibold text-foreground min-w-14">Chest:</span>
              <span>Garment width measured 1 inch below the armhole across the front.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-semibold text-foreground min-w-14">Waist:</span>
              <span>Garment width measured across the waistline.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-semibold text-foreground min-w-14">Hip:</span>
              <span>Garment width measured across the shirt flare for a graceful, comfortable drape.</span>
            </li>
          </ul>
        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 py-4 sm:px-8 bg-muted/30 border-t border-border flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-7 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] bg-[#FF3154] hover:bg-[#FF3154]/90 text-white rounded-xs transition-colors shadow-xs cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

export default SizeChartModal;
