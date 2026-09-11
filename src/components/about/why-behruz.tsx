"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Palette, Scissors, Crown } from "lucide-react";

interface BenefitItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

const BENEFITS: BenefitItem[] = [
  {
    icon: Sparkles,
    title: "Exquisite Fabrics",
    description:
      "Finest chiffon, pure silk, sheesha silk, and zari selected for their luxurious drape and luminous finish.",
  },
  {
    icon: Palette,
    title: "Timeless Silhouettes",
    description:
      "From sophisticated frocks and farshi shalwars to contemporary formal ensembles crafted for enduring elegance.",
  },
  {
    icon: Scissors,
    title: "Intricate Detailing",
    description:
      "Artisanal handwork, delicate embroidery, and multi-thread embellishments executed with precision.",
  },
  {
    icon: Crown,
    title: "Accessible Luxury",
    description:
      "Exceptional Pakistani fashion and craftsmanship provided at wholesale-friendly prices for both individuals and resellers.",
  },
];

export function WhyBehruz() {
  return (
    <section
      aria-labelledby="why-behruz-heading"
      className="relative w-full bg-background py-16 sm:py-24 border-b border-border/60"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium block mb-3"
          >
            OUR DISTINCTION
          </motion.span>
          <motion.h2
            id="why-behruz-heading"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-foreground"
          >
            Why Behruz
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-12 h-[1px] bg-primary mx-auto mt-5"
          />
        </div>

        {/* 4 Benefits in an Editorial Layout (Delicate dividers, no SaaS cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {BENEFITS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-start pt-6 border-t border-border/80"
              >
                {/* Subtle Icon */}
                <div className="w-10 h-10 rounded-full border border-border/80 bg-background flex items-center justify-center mb-5 text-primary">
                  <Icon className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg sm:text-xl font-normal text-foreground mb-3 leading-snug">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyBehruz;
