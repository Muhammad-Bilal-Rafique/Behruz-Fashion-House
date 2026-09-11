"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface HeroData {
  heading?: string;
  description?: string;
  buttonText?: string;
  button2Text?: string;
  imageUrl?: string;
}

interface HeroProps {
  data?: HeroData | null;
}

export function Hero({ data }: HeroProps) {
  const headingText = data?.heading || "Elegance, Redefined.";
  const description =
    data?.description ||
    "Timeless Pakistani fashion crafted for every occasion.";
  const buttonText = data?.buttonText || "Shop Collection";
  const button2Text = data?.button2Text || "Explore New Arrivals";
  const imageUrl = data?.imageUrl || "/hero-desktop.jpg";

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: custom * 0.12,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  // Split heading by comma for luxury italic accent if present
  const headingTextStr = headingText || "Elegance, Redefined.";
  const hasComma = headingTextStr.includes(",");
  const [firstHeadingPart, ...restParts] = headingTextStr.split(",");
  const secondHeadingPart = restParts.join(",");

  return (
    <section
      aria-label="Behruz Fashion House Hero Showcase"
      className="relative w-full md:h-[calc(100vh-5rem)] md:min-h-[640px] flex flex-col md:flex-row md:items-center overflow-hidden bg-white md:bg-neutral-950"
    >
      {/* ============================================================ */}
      {/* 1. HERO IMAGE: UNCROPPED ON MOBILE, FULL-SCREEN ON DESKTOP    */}
      {/* ============================================================ */}
      <div className="relative w-full aspect-[4/3] xs:aspect-[16/10] sm:aspect-[2/1] md:aspect-auto md:absolute md:inset-0 z-0 overflow-hidden bg-white md:bg-neutral-950 flex-shrink-0">
        {/* Hero image: uncropped on mobile (object-contain), full-screen on desktop (object-cover) */}
        <Image
          src={imageUrl}
          alt="Behruz Fashion House - Premium Pakistani Haute Couture"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 100vw"
          className="object-contain md:object-cover object-center z-10"
        />

        {/* Cinematic Desktop Overlay - keeps the whole image visible across full screen */}
        <div
          className="hidden md:block absolute inset-0 z-20 bg-gradient-to-r from-black/75 via-black/35 via-45% to-black/15 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* ============================================================ */}
      {/* 2. EDITORIAL HERO CONTENT                                     */}
      {/* ============================================================ */}
      <div className="relative z-10 flex-1 md:flex-initial w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10 md:py-20 lg:py-24 flex flex-col justify-center bg-white md:bg-transparent">
        <div className="max-w-xl lg:max-w-2xl text-center md:text-left mx-auto md:mx-0">
          {/* Eyebrow */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="inline-flex items-center justify-center md:justify-start gap-3 mb-3 sm:mb-5"
          >
            <span
              className="h-[1px] w-7 sm:w-9 bg-[#FF3154]"
              aria-hidden="true"
            />
            <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#FF3154]">
              BEHRUZ FASHION HOUSE
            </span>
            <span
              className="md:hidden h-[1px] w-7 sm:w-9 bg-[#FF3154]"
              aria-hidden="true"
            />
          </motion.div>

          {/* Headline (Dark on mobile white bg, crisp white against desktop dark overlay) */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal tracking-tight text-neutral-900 md:text-white leading-[1.15]"
          >
            {hasComma ? (
              <>
                {firstHeadingPart},
                <span className="italic font-light text-neutral-700 md:text-white/90 ml-2">
                  {secondHeadingPart.trim()}
                </span>
              </>
            ) : (
              headingTextStr
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mt-3 sm:mt-5 text-sm sm:text-base lg:text-lg text-neutral-600 md:text-white/80 font-light leading-relaxed max-w-lg mx-auto md:mx-0"
          >
            {description}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto md:mx-0"
          >
            {/* Primary CTA Button: Brand Pink #FF3154 */}
            <Link
              href="/shop"
              className="group relative inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 text-xs uppercase tracking-[0.22em] font-medium bg-[#FF3154] text-white transition-all duration-300 hover:bg-[#FF3154]/90 hover:shadow-lg hover:shadow-[#FF3154]/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3154] focus-visible:ring-offset-2"
            >
              <span>{buttonText}</span>
              <ArrowRight
                className="ml-2.5 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.75}
              />
            </Link>

            {/* Secondary CTA Button: Clean Border on Mobile, Glassmorphism Outline on Desktop */}
            {button2Text && (
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center px-6 sm:px-7 py-3.5 sm:py-4 text-xs uppercase tracking-[0.22em] font-medium text-neutral-900 border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 md:text-white md:border-white/30 md:bg-white/5 md:hover:border-[#FF3154] md:hover:text-[#FF3154] transition-colors duration-300 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF3154]"
              >
                <span>{button2Text}</span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
