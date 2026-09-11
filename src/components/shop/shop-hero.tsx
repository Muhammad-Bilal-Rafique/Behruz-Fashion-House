"use client";

import React from "react";
import { motion } from "framer-motion";

export function ShopHero() {
  return (
    <header className="pt-8 pb-4 sm:pt-12 sm:pb-6 text-center max-w-3xl mx-auto px-4">
      {/* Small uppercase eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="inline-flex items-center gap-2 mb-2"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
          The Collection
        </span>
      </motion.div>

      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-foreground mb-3"
      >
        Shop
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
        className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed font-light"
      >
        Discover the latest collection from Behruz Fashion House.
      </motion.p>
    </header>
  );
}

export default ShopHero;
