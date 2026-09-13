"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, CreditCard, MessageCircle, ShoppingBag } from "lucide-react";

interface MarqueeItem {
  icon: React.ElementType;
  label: string;
}

const MARQUEE_ITEMS: MarqueeItem[] = [
  {
    icon: Globe,
    label: "Worldwide Delivery",
  },
  {
    icon: CreditCard,
    label: "COD (PKR 1k Advance)",
  },
  {
    icon: MessageCircle,
    label: "Customer Support",
  },
  {
    icon: ShoppingBag,
    label: "Online Orders",
  },
];

// Repeat items to ensure seamless, unbroken infinite loop across all display sizes
const REPEATED_SETS = [0, 1, 2, 3];

export function TrustBar() {
  return (
    <aside
      aria-label="Store Announcements"
      className="relative w-full h-14 bg-background border-y border-border overflow-hidden flex items-center select-none"
    >
      {/* Subtle edge fade overlays for luxury editorial look */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-background to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-background to-transparent z-10"
        aria-hidden="true"
      />

      {/* Infinite Scrolling Track */}
      <div className="flex w-full overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 32,
            repeat: Infinity,
          }}
          className="flex items-center whitespace-nowrap will-change-transform"
        >
          {/* Render 2 identical halves (each containing 2 full sets) so -50% loop is seamless */}
          {[0, 1].map((halfIndex) => (
            <div key={halfIndex} className="flex items-center shrink-0">
              {REPEATED_SETS.map((setIdx) => (
                <div key={setIdx} className="flex items-center shrink-0">
                  {MARQUEE_ITEMS.map((item) => (
                    <div
                      key={`${halfIndex}-${setIdx}-${item.label}`}
                      className="flex items-center shrink-0"
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4">
                        <item.icon
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] font-medium text-foreground">
                          {item.label}
                        </span>
                      </div>

                      {/* Elegant Star Separator */}
                      <span
                        className="text-[9px] sm:text-[10px] text-primary/60 px-3 sm:px-5 font-serif select-none"
                        aria-hidden="true"
                      >
                        ✦
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </aside>
  );
}

export default TrustBar;
