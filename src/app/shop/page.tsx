import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ShopContainer from "@/components/shop/shop-container";

export const metadata: Metadata = {
  title: "Shop Collection | Behruz Fashion House",
  description:
    "Explore the latest collection of timeless Pakistani fashion from Behruz Fashion House. Handcrafted luxury pret, formal wear, and bespoke couture.",
  openGraph: {
    title: "Shop Collection | Behruz Fashion House",
    description:
      "Explore the latest collection of timeless Pakistani fashion from Behruz Fashion House.",
    type: "website",
  },
};

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Existing Customer-Facing Navbar */}
      <Navbar />

      {/* Main Shop Section */}
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <ShopContainer />
        </Suspense>
      </main>

      {/* Existing Customer-Facing Footer */}
      <Footer />
    </div>
  );
}
