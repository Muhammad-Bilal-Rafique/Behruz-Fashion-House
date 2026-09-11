"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FaqCTA() {
  return (
    <section
      aria-labelledby="faq-cta-heading"
      className="relative w-full bg-muted/20 border-t border-border/70 py-16 sm:py-24"
    >
      <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
        {/* Small uppercase label */}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-[11px] uppercase tracking-[0.3em] text-primary font-medium block mb-3"
        >
          NEED MORE HELP?
        </motion.span>

        {/* Heading */}
        <motion.h2
          id="faq-cta-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground mb-3"
        >
          Still have questions?
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="text-sm sm:text-base text-muted-foreground font-light max-w-md mx-auto mb-8"
        >
          Our team is happy to help you with your order or product questions.
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="flex items-center justify-center"
        >
          <Link
            href="/contact"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 bg-primary text-white text-xs sm:text-sm uppercase tracking-[0.25em] font-medium transition-all duration-300 ease-out hover:opacity-95 hover:shadow-md hover:translate-y-[-1px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span>Contact Us</span>
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

export default FaqCTA;
