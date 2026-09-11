import type { Metadata } from "next";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CartView from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Shopping Bag | Behruz Fashion House",
  description:
    "Review your selected luxury Pakistani pret and couture items in your shopping bag before proceeding to checkout.",
  openGraph: {
    title: "Shopping Bag | Behruz Fashion House",
    description:
      "Review your selected luxury Pakistani pret and couture items in your shopping bag.",
    type: "website",
  },
};

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#FF3154]/20 selection:text-[#FF3154]">
      {/* Customer Navbar */}
      <Navbar />

      {/* Main Cart Content Area */}
      <main className="flex-1">
        <CartView />
      </main>

      {/* Customer Footer */}
      <Footer />
    </div>
  );
}
