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
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-lg bg-[#0F0E0E] text-[#FAFAFA] border border-[#D4AF37]/35 rounded-xs shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Subtle Luxury Gradient Accent at the top */}
        <div className="h-1 w-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close size chart"
          className="absolute top-4 right-4 text-[#C5A059]/80 hover:text-[#F3E5AB] hover:bg-white/5 rounded-xs p-1.5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Behruz Fashion House</span>
            <Sparkles className="w-3 h-3" />
          </div>
          <h2
            id="size-chart-title"
            className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#FFFFFF]"
          >
            Size Guide & Measurements
          </h2>
          <p className="mt-1.5 text-xs text-neutral-400 font-light max-w-sm mx-auto">
            All garment measurements are in <strong>inches</strong>. Crafted to standard luxury Pakistani pret & couture silhouettes.
          </p>
        </div>

        {/* Table Container styled with gold luxury borders */}
        <div className="px-6 py-2 sm:px-8">
          <div className="overflow-hidden rounded-xs border border-[#D4AF37]/40 shadow-inner">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#D4AF37]/25 via-[#D4AF37]/35 to-[#D4AF37]/25 border-b border-[#D4AF37]/40 text-[#F5E6BE]">
                  <th className="py-3 px-4 font-serif text-sm font-semibold tracking-wider uppercase border-r border-[#D4AF37]/30">
                    Size
                  </th>
                  <th className="py-3 px-4 font-serif text-sm font-semibold tracking-wider uppercase border-r border-[#D4AF37]/30">
                    Chest <span className="text-[10px] font-sans font-normal opacity-80">(in)</span>
                  </th>
                  <th className="py-3 px-4 font-serif text-sm font-semibold tracking-wider uppercase border-r border-[#D4AF37]/30">
                    Waist <span className="text-[10px] font-sans font-normal opacity-80">(in)</span>
                  </th>
                  <th className="py-3 px-4 font-serif text-sm font-semibold tracking-wider uppercase">
                    Hips <span className="text-[10px] font-sans font-normal opacity-80">(in)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/25 text-neutral-200">
                {SIZE_DATA.map((row, index) => (
                  <tr
                    key={row.size}
                    className={`transition-colors hover:bg-white/[0.04] ${
                      index % 2 === 1 ? "bg-white/[0.015]" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-serif text-sm font-medium text-[#F3E5AB] border-r border-[#D4AF37]/25">
                      {row.size}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-mono tracking-wide text-neutral-100 border-r border-[#D4AF37]/25">
                      {row.chest}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-mono tracking-wide text-neutral-100 border-r border-[#D4AF37]/25">
                      {row.waist}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-mono tracking-wide text-neutral-100">
                      {row.hips}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Measurement Tips / Helper */}
        <div className="px-6 py-5 sm:px-8 text-xs text-neutral-400 space-y-2 border-t border-neutral-800/80 mt-4 bg-black/40">
          <div className="flex items-center gap-1.5 text-[#D4AF37] font-medium tracking-wide uppercase text-[11px]">
            <Ruler className="w-3.5 h-3.5" />
            <span>How to Measure</span>
          </div>
          <ul className="space-y-1 text-[11px] text-neutral-400 leading-relaxed list-disc list-inside">
            <li>
              <strong className="text-neutral-200 font-medium">Chest:</strong> Measure across the fullest part of the bust (armhole to armhole).
            </li>
            <li>
              <strong className="text-neutral-200 font-medium">Waist:</strong> Measure across the narrowest natural waist point.
            </li>
            <li>
              <strong className="text-neutral-200 font-medium">Hips:</strong> Measure across the fullest part of the hip line.
            </li>
          </ul>
        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 py-4 sm:px-8 bg-black/60 border-t border-neutral-800/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0A0A0A] rounded-xs transition-colors shadow-xs cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

export default SizeChartModal;
