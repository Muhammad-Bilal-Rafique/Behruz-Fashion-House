"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: custom * 0.1,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  }),
};

export function ContactHero() {
  return (
    <header className="relative w-full bg-background pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-14 border-b border-border/60">
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
            GET IN TOUCH
          </span>
          <span className="h-[1px] w-6 sm:w-8 bg-primary/70" aria-hidden="true" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-foreground leading-[1.18] mb-4"
        >
          We&apos;d Love to Hear From You
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed max-w-xl mx-auto"
        >
          Have a question about our collections, orders or anything else? Our team is here to help.
        </motion.p>
      </div>
    </header>
  );
}

export default ContactHero;
