"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * BRAND INTRODUCTION
 * -------------------------------------------------------------
 * NOTE FOR CLIENT / DEVELOPER:
 * The paragraphs below represent temporary placeholder brand copy
 * describing Behruz Fashion House. When the final brand narrative
 * is ready, simply replace the text strings in the right-hand column.
 * -------------------------------------------------------------
 */

export function BrandIntro() {
  return (
    <section
      aria-labelledby="brand-intro-heading"
      className="relative w-full bg-background py-16 sm:py-24 border-b border-border/60"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-20 items-start">
          {/* Left Column: Editorial Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium block mb-3">
              THE ESSENCE
            </span>
            <h2
              id="brand-intro-heading"
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-foreground leading-[1.18]"
            >
              Made for the woman who defines her own style.
            </h2>
            <div className="w-12 h-[1px] bg-primary mt-6 sm:mt-8" />
          </motion.div>

          {/* Right Column: Official Brand Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-foreground/85 font-light text-base sm:text-lg leading-relaxed"
          >
            <p>
              Behruz Fashion House is a premium fashion destination offering elegant and
              beautifully crafted Pakistani traditional and formal wear. Our collections
              feature exquisite fabrics such as chiffon, pure silk, sheesha silk and zari,
              enhanced with intricate handwork, embroidery and multi-thread detailing.
            </p>

            <p className="text-muted-foreground">
              From sophisticated frocks and farshi shalwars to luxurious formal ensembles,
              every piece is designed to combine timeless Pakistani elegance with contemporary style.
            </p>

            {/* Editorial quote / commitment accent */}
            <blockquote className="border-l-2 border-primary/60 pl-5 py-2 my-5 text-foreground font-serif italic text-lg sm:text-xl leading-relaxed">
              &ldquo;Committed to offering exceptional designs, quality fabrics and detailed
              craftsmanship at wholesale-friendly prices—making premium fashion accessible for
              both individual customers and resellers.&rdquo;
            </blockquote>

            <div className="pt-2 flex flex-wrap gap-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              <span className="px-3 py-1 bg-muted/50 border border-border">Pure Silk &amp; Sheesha Silk</span>
              <span className="px-3 py-1 bg-muted/50 border border-border">Chiffon &amp; Zari</span>
              <span className="px-3 py-1 bg-muted/50 border border-border">Frocks &amp; Farshi Shalwars</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default BrandIntro;
