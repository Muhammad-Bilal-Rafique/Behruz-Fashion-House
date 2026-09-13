"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Globe, ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
} from "@/components/shared/social-icons";
import { useStoreSettings } from "@/components/providers/store-settings-provider";

interface FooterLink {
  label: string;
  href: string;
}

const SHOP_LINKS: FooterLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/shop" },
  { label: "Wishlist", href: "/wishlist" },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
];

const HELP_LINKS: FooterLink[] = [
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const settings = useStoreSettings();

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Frontend UI only - API integration to be implemented later
    toast.info("Newsletter signup will be available soon.");
    setEmail("");
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Site Footer"
      className="w-full bg-background border-t border-border text-foreground pt-14 sm:pt-20 pb-10 sm:pb-12"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* ============================================================ */}
        {/* 1. TOP BRAND & NEWSLETTER ROW                                */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-12 sm:pb-16 border-b border-border/80">
          {/* Brand Introduction */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <Link
              href="/"
              className="inline-block transition-opacity duration-200 hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
              aria-label="Behruz Fashion House Home"
            >
              <Image
                src="/logo.png"
                alt="Behruz Fashion House"
                width={160}
                height={56}
                className="h-10 sm:h-12 w-auto object-contain mb-5"
              />
            </Link>

            <h2 className="font-serif italic text-xl sm:text-2xl text-foreground/95 font-light tracking-tight mb-2">
              &ldquo;Your fashion Defines you&rdquo;
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed max-w-md">
              Discover elegant Pakistani fashion designed to express your individual
              style. Crafted with grace, timeless cuts, and exquisite attention to detail.
            </p>
          </div>

          {/* 5. Newsletter Section */}
          <div className="lg:col-span-6 flex flex-col items-start lg:items-end w-full">
            <div className="w-full max-w-md">
              <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-medium block mb-1">
                NEWSLETTER
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-normal text-foreground mb-1">
                Stay in the know
              </h3>
              <p className="text-xs text-muted-foreground font-light mb-4">
                Be the first to discover new collections and updates from Behruz.
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-2.5 w-full"
                noValidate
              >
                <label htmlFor="footer-newsletter-email" className="sr-only">
                  Your email address
                </label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  aria-label="Your email address"
                  className="flex-1 px-4 py-2.5 text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:opacity-95 hover:shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2, 3, 4. NAVIGATION, CONTACT & SOCIAL COLUMNS                */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10 pt-12 sm:pt-16">
          {/* Column 1: SHOP */}
          <nav aria-label="Shop Navigation">
            <h4 className="text-xs uppercase tracking-[0.25em] font-medium text-foreground mb-4">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-light">
              {SHOP_LINKS.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors duration-200 block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 2: COMPANY */}
          <nav aria-label="Company Navigation">
            <h4 className="text-xs uppercase tracking-[0.25em] font-medium text-foreground mb-4">
              COMPANY
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-light">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors duration-200 block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: HELP */}
          <nav aria-label="Customer Care Navigation">
            <h4 className="text-xs uppercase tracking-[0.25em] font-medium text-foreground mb-4">
              HELP
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-light">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors duration-200 block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: CONTACT */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] font-medium text-foreground mb-4">
              CONTACT
            </h4>
            <ul className="space-y-3 text-xs text-muted-foreground font-light">
              <li>
                <a
                  href={`tel:+${settings.whatsappNumber.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors duration-200"
                  aria-label={`Call ${settings.whatsappDisplayNumber || settings.whatsappNumber}`}
                >
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.5} />
                  <span>{settings.whatsappDisplayNumber || settings.whatsappNumber}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors duration-200"
                  aria-label={`Email ${settings.supportEmail}`}
                >
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.5} />
                  <span>{settings.supportEmail}</span>
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-muted-foreground">
                <Globe className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.5} />
                <span>Worldwide Delivery</span>
              </li>
            </ul>
          </div>

          {/* Column 5: SOCIAL */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="text-xs uppercase tracking-[0.25em] font-medium text-foreground mb-4">
              SOCIAL
            </h4>
            <div className="flex flex-col items-start gap-2.5">
              <a
                href="https://www.instagram.com/behruzfashionhouse/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Behruz Fashion House on Instagram"
                className="group inline-flex items-center gap-2.5 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary group-hover:text-primary group-hover:scale-105">
                  <InstagramIcon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="font-light">Instagram</span>
              </a>

              <a
                href="https://www.tiktok.com/@behruzfashionhouse"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Behruz Fashion House on TikTok"
                className="group inline-flex items-center gap-2.5 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary group-hover:text-primary group-hover:scale-105">
                  <TikTokIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-light">TikTok</span>
              </a>

              <a
                href="https://www.facebook.com/Behruzfashionhouse"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Behruz Fashion House on Facebook"
                className="group inline-flex items-center gap-2.5 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary group-hover:text-primary group-hover:scale-105">
                  <FacebookIcon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="font-light">Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6, 7, 8. DIVIDER & BOTTOM BAR WITH SUBTLE ADMIN LINK         */}
        {/* ============================================================ */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Copyright */}
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-light order-2 sm:order-1">
            &copy; 2026 Behruz Fashion House. All rights reserved.
          </p>

          {/* Center: Very subtle Admin Navigation link */}
          <div className="order-1 sm:order-2">
            <Link
              href="/admin/login"
              className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/35 hover:text-muted-foreground focus-visible:text-primary transition-colors duration-200 outline-none"
              aria-label="Admin Access"
            >
              Admin
            </Link>
          </div>

          {/* Right: Legal links */}
          <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-light order-3">
            <Link
              href="/privacy-policy"
              className="hover:text-primary transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="text-border" aria-hidden="true">
              &bull;
            </span>
            <Link
              href="/terms-and-conditions"
              className="hover:text-primary transition-colors duration-200"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
