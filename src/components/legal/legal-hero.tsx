"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

interface LegalHeroProps {
  eyebrow: string;
  heading: string;
  description: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.08,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  }),
};

export function LegalHero({ eyebrow, heading, description }: LegalHeroProps) {
  return (
    <header className="relative w-full bg-background pt-14 sm:pt-20 pb-12 sm:pb-16 border-b border-border/70">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        {/* Eyebrow */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="inline-flex items-center justify-center gap-3 mb-4"
        >
          <span className="h-[1px] w-6 sm:w-8 bg-primary/70" aria-hidden="true" />
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-medium text-primary">
            {eyebrow}
          </span>
          <span className="h-[1px] w-6 sm:w-8 bg-primary/70" aria-hidden="true" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-foreground leading-[1.2] mb-4"
        >
          {heading}
        </motion.h1>

        {/* Description */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto"
        >
          {description}
        </motion.p>
      </div>
    </header>
  );
}

export default LegalHero;
