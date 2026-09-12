"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import { useCartHydrated } from "@/lib/cart-store";
import { useWishlistHydrated } from "@/lib/wishlist-store";
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
} from "@/components/shared/social-icons";

export interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
  className?: string;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar({
  cartCount,
  wishlistCount,
  className = "",
}: NavbarProps) {
  const { totalQuantity, hasHydrated: isCartHydrated } = useCartHydrated();
  const { totalCount: wishlistTotal, hasHydrated: isWishlistHydrated } = useWishlistHydrated();

  const effectiveCartCount =
    cartCount !== undefined ? cartCount : isCartHydrated ? totalQuantity : 0;
  const effectiveWishlistCount =
    wishlistCount !== undefined
      ? wishlistCount
      : isWishlistHydrated
      ? wishlistTotal
      : 0;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect scroll to adjust subtle shadow and depth while keeping clean aesthetic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu and search on pathname change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      router.push(`/shop?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-background transition-shadow duration-300 border-b border-border ${
        isScrolled ? "shadow-xs" : ""
      } ${className}`}
    >
      {/* ============================================================ */}
      {/* DESKTOP NAVBAR (Hidden on mobile < md)                         */}
      {/* ============================================================ */}
      <div className="hidden md:flex h-20 max-w-7xl mx-auto px-6 lg:px-12 items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex-1 flex items-center justify-start">
          <Link
            href="/"
            className="inline-flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs transition-opacity duration-200 hover:opacity-90"
            aria-label="Behruz Fashion House Home"
          >
            <Image
              src="/logo.png"
              alt="Behruz Fashion House"
              width={160}
              height={160}
              priority
              className="h-14 lg:h-16 w-auto object-contain py-1"
            />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav
          className="flex items-center justify-center gap-8 lg:gap-12"
          aria-label="Main Desktop Navigation"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 text-xs font-medium uppercase tracking-[0.22em] transition-colors duration-200 ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="desktop-active-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Search, Wishlist, Bag) */}
        <div className="flex-1 flex items-center justify-end gap-5 lg:gap-6">
          {/* Search Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label={isSearchOpen ? "Close search bar" : "Open search bar"}
            aria-expanded={isSearchOpen}
            className={`p-2 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
              isSearchOpen
                ? "text-primary bg-secondary"
                : "text-foreground hover:text-primary"
            }`}
          >
            {isSearchOpen ? (
              <X className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Search className="w-5 h-5" strokeWidth={1.5} />
            )}
          </motion.button>

          {/* Wishlist Link */}
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${effectiveWishlistCount} items`}
              className="relative p-2 block text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-full"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              {effectiveWishlistCount > 0 && (
                <span className="absolute 1 top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground leading-none">
                  {effectiveWishlistCount > 99 ? "99+" : effectiveWishlistCount}
                </span>
              )}
            </Link>
          </motion.div>

          {/* Cart / Shopping Bag Link */}
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
            <Link
              href="/cart"
              aria-label={`Shopping Bag, ${effectiveCartCount} items`}
              className="relative p-2 block text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-full"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {effectiveCartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground leading-none">
                  {effectiveCartCount > 99 ? "99+" : effectiveCartCount}
                </span>
              )}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE NAVBAR (Visible on mobile < md)                        */}
      {/* ============================================================ */}
      <div className="flex md:hidden h-16 sm:h-20 px-4 sm:px-6 items-center justify-between">
        {/* Left: Hamburger Menu Button */}
        <div className="flex-1 flex items-center justify-start">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
            aria-expanded={isMobileMenuOpen}
            className="p-2 -ml-2 text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </motion.button>
        </div>

        {/* Center: Brand Logo */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs transition-opacity duration-200 hover:opacity-90"
            aria-label="Behruz Fashion House Home"
          >
            <Image
              src="/logo.png"
              alt="Behruz Fashion House"
              width={120}
              height={120}
              priority
              className="h-11 sm:h-13 w-auto object-contain py-1"
            />
          </Link>
        </div>

        {/* Right: Search, Wishlist & Cart Icons */}
        <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2">
          {/* Mobile Search Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label={isSearchOpen ? "Close search bar" : "Open search bar"}
            aria-expanded={isSearchOpen}
            className={`p-2 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
              isSearchOpen
                ? "text-primary bg-secondary"
                : "text-foreground hover:text-primary"
            }`}
          >
            {isSearchOpen ? (
              <X className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Search className="w-5 h-5" strokeWidth={1.5} />
            )}
          </motion.button>
          <motion.div whileTap={{ scale: 0.92 }}>
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${effectiveWishlistCount} items`}
              className="relative p-2 block text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-full"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              {effectiveWishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground leading-none">
                  {effectiveWishlistCount > 99 ? "99+" : effectiveWishlistCount}
                </span>
              )}
            </Link>
          </motion.div>

          <motion.div whileTap={{ scale: 0.92 }}>
            <Link
              href="/cart"
              aria-label={`Shopping Bag, ${effectiveCartCount} items`}
              className="relative p-2 block text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-full"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {effectiveCartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground leading-none">
                  {effectiveCartCount > 99 ? "99+" : effectiveCartCount}
                </span>
              )}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* EXPANDABLE SEARCH OVERLAY (Mobile & Desktop)                 */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-background shadow-sm"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center"
              >
                <Search
                  className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none"
                  strokeWidth={1.5}
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections, pieces, styles..."
                  className="w-full pl-9 sm:pl-10 pr-20 sm:pr-24 py-2 sm:py-2.5 text-xs sm:text-sm bg-muted/50 border border-border rounded-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors duration-200"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="submit"
                    className="px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs uppercase tracking-widest font-medium bg-foreground text-background hover:bg-primary transition-colors duration-200"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    aria-label="Close search"
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MOBILE SHEET / SLIDE-OUT DRAWER MENU                         */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide-out Sheet */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
              className="relative z-10 w-[85%] max-w-sm h-full bg-background border-r border-border shadow-2xl flex flex-col justify-between"
            >
              {/* Sheet Header */}
              <div>
                <div className="flex items-center justify-between h-16 sm:h-20 px-6 border-b border-border">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs transition-opacity duration-200 hover:opacity-90"
                    aria-label="Behruz Fashion House Home"
                  >
                    <Image
                      src="/logo.png"
                      alt="Behruz Fashion House"
                      width={120}
                      height={120}
                      className="h-11 sm:h-12 w-auto object-contain py-1"
                    />
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-2 -mr-2 text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </motion.button>
                </div>

                {/* Mobile Search Bar inside Sheet */}
                <div className="p-6 border-b border-border bg-muted/20">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Behruz..."
                      className="w-full pl-9 pr-4 py-2.5 text-xs tracking-wider bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                      strokeWidth={1.5}
                    />
                  </form>
                </div>

                {/* Mobile Navigation Links */}
                <nav
                  className="px-6 py-6 flex flex-col gap-1"
                  aria-label="Mobile Navigation Links"
                >
                  {NAV_LINKS.map((link, idx) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname?.startsWith(link.href);

                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.05 * (idx + 1),
                          duration: 0.3,
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center justify-between py-3.5 border-b border-border/50 text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-200 ${
                            isActive
                              ? "text-primary font-semibold"
                              : "text-foreground hover:text-primary"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            {isActive && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                            )}
                            {link.label}
                          </span>
                          <ArrowRight
                            className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 ${
                              isActive ? "text-primary" : "text-muted-foreground"
                            }`}
                            strokeWidth={1.5}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Sheet Footer */}
              <div className="p-6 border-t border-border bg-muted/10">
                <div className="flex items-center justify-around py-3 border border-border bg-background">
                  <Link
                    href="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                  >
                    <Heart className="w-4 h-4" strokeWidth={1.5} />
                    <span>Wishlist ({effectiveWishlistCount})</span>
                  </Link>
                  <div className="w-[1px] h-4 bg-border" />
                  <Link
                    href="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                    <span>Bag ({effectiveCartCount})</span>
                  </Link>
                </div>

                {/* Social Media Links */}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <a
                    href="https://www.instagram.com/behruzfashionhouse/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Behruz Fashion House on Instagram"
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </a>
                  <a
                    href="https://www.tiktok.com/@behruzfashionhouse"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Behruz Fashion House on TikTok"
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                  >
                    <TikTokIcon className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://www.facebook.com/Behruzfashionhouse"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Behruz Fashion House on Facebook"
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                  >
                    <FacebookIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </a>
                </div>

                <p className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Behruz Fashion House
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
