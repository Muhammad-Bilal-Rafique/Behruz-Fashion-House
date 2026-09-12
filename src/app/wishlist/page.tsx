import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import WishlistView from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "My Wishlist | Behruz Fashion House",
  description: "View and manage your saved luxury Pakistani couture and pret pieces.",
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#FF3154]/20 selection:text-[#FF3154]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
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

        {/* Dynamic Wishlist View (Zustand-powered) */}
        <WishlistView />
      </main>

      <Footer />
    </div>
  );
}
