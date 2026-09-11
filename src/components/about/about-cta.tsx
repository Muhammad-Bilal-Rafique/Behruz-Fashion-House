"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function AboutCTA() {
  return (
    <section
      aria-labelledby="about-cta-heading"
      className="relative w-full bg-background py-20 sm:py-28"
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[11px] uppercase tracking-[0.3em] text-primary font-medium block mb-4"
        >
          BEHRUZ FASHION HOUSE
        </motion.span>

        {/* Heading */}
        <motion.h2
          id="about-cta-heading"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-foreground mb-4 leading-tight"
        >
          Discover Your Style
        </motion.h2>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-muted-foreground font-light max-w-md mx-auto mb-9"
        >
          Explore the latest collection from Behruz Fashion House.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center"
        >
          <Link
            href="/shop"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 bg-primary text-white text-xs sm:text-sm uppercase tracking-[0.25em] font-medium transition-all duration-300 ease-out hover:opacity-95 hover:shadow-md hover:translate-y-[-1px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span>Shop Collection</span>
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutCTA;
