import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "My Wishlist | Behruz Fashion House",
  description: "View and manage your saved luxury Pakistani couture and pret pieces.",
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li className="text-muted-foreground/40">/</li>
            <li aria-current="page" className="text-foreground font-medium">
              Wishlist
            </li>
          </ol>
        </nav>

        {/* Wishlist Header & Empty State */}
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-secondary/80 text-primary flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 stroke-[1.5]" />
          </div>

          <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium block mb-2">
            BEHRUZ FASHION HOUSE
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground mb-3">
            Your Wishlist
          </h1>

          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-8">
            You haven&apos;t saved any pieces to your wishlist yet. Explore our latest luxury pret and couture to save your favorite designs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-xs uppercase tracking-[0.22em] font-medium bg-[#FF3154] text-white hover:bg-[#FF3154]/90 transition-colors shadow-xs"
            >
              <span>Explore Collection</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              href="/cart"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.22em] font-medium text-foreground border border-border hover:border-foreground transition-colors"
            >
              <ShoppingBag className="mr-2 w-4 h-4" />
              <span>View Bag</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
