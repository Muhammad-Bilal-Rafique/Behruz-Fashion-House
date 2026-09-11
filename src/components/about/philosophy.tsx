"use client";

import React from "react";
import { motion } from "framer-motion";

interface PhilosophyItem {
  number: string;
  title: string;
  description: string;
}

const PHILOSOPHY_POINTS: PhilosophyItem[] = [
  {
    number: "01",
    title: "ELEGANCE",
    description:
      "Timeless details designed to make every look feel effortlessly refined.",
  },
  {
    number: "02",
    title: "CRAFT",
    description:
      "Thoughtful fabrics, intricate details and carefully considered designs.",
  },
  {
    number: "03",
    title: "INDIVIDUALITY",
    description:
      "Fashion that allows every woman to express her own identity.",
  },
];

export function Philosophy() {
  return (
    <section
      aria-labelledby="philosophy-heading"
      className="relative w-full bg-background py-16 sm:py-24 border-b border-border/60"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium block mb-3"
          >
            GUIDING PRINCIPLES
          </motion.span>
          <motion.h2
            id="philosophy-heading"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-foreground"
          >
            Our Philosophy
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-12 h-[1px] bg-primary mx-auto mt-5"
          />
        </div>

        {/* 3 Editorial Points (Clean Grid, not bulky cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-14">
          {PHILOSOPHY_POINTS.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className="relative pt-6 border-t border-border flex flex-col"
            >
              {/* Point Number and Title */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-serif text-2xl sm:text-3xl text-primary font-light">
                  {item.number}
                </span>
                <span className="text-muted-foreground/50 text-sm" aria-hidden="true">
                  —
                </span>
                <h3 className="text-sm uppercase tracking-[0.22em] font-medium text-foreground">
                  {item.title}
                </h3>
              </div>

              {/* Point Description */}
              <p className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Philosophy;
