"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { EditorialImagePlaceholder } from "./image-placeholder";

/**
 * To replace the Hero image with final photography:
 * 1. Place your image in /public (e.g. /public/about-hero.jpg)
 * 2. Set HERO_IMAGE_SRC = "/about-hero.jpg" below.
 */
const HERO_IMAGE_SRC: string | undefined = "/about-hero.jpg";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: custom * 0.12,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  }),
};

export function AboutHero() {
  return (
    <header className="relative w-full overflow-hidden bg-background pt-10 sm:pt-14 lg:pt-18 pb-16 sm:pb-20 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-center">
          {/* Left Column: Text & Editorial Typography */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="inline-flex items-center gap-3 mb-5"
            >
              <span
                className="h-[1px] w-8 bg-primary/80"
                aria-hidden="true"
              />
              <span className="text-xs uppercase tracking-[0.3em] font-medium text-primary">
                ABOUT BEHRUZ
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-foreground leading-[1.12] mb-6"
            >
              Where Fashion{" "}
              <span className="relative inline-block">
                <span className="italic font-light text-foreground/95">Defines You</span>
                {/* Subtle pink accent underline */}
                <span
                  className="absolute left-0 -bottom-1 sm:-bottom-2 w-full h-[2px] bg-primary/70 rounded-full"
                  aria-hidden="true"
                />
              </span>
            </motion.h1>

            {/* Short Supporting Text */}
            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-xl mb-8"
            >
              Discover timeless Pakistani fashion crafted with elegance, detail and
              a modern sense of style.
            </motion.p>

            {/* Subtle editorial meta bar */}
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="pt-6 border-t border-border/80 w-full max-w-md flex items-center justify-between text-xs tracking-widest uppercase text-muted-foreground"
            >
              <span>HAUTE COUTURE &bull; PRET</span>
              <span className="text-primary font-medium">BEHRUZ FASHION HOUSE</span>
            </motion.div>
          </div>

          {/* Right Column: Editorial Hero Visual Placeholder */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="lg:col-span-5 w-full"
          >
            <EditorialImagePlaceholder
              src={HERO_IMAGE_SRC}
              alt="Behruz Fashion House editorial visual showcase"
              aspectRatio="aspect-[4/5]"
              label="ABOUT HERO VISUAL"
              sublabel="Timeless Pakistani Couture"
              priority
              className="w-full shadow-xs"
            />
          </motion.div>
        </div>
      </div>
    </header>
  );
}

export default AboutHero;
