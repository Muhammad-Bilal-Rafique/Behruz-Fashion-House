import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ShopContainer from "@/components/shop/shop-container";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import { calculateDiscountPercentage } from "@/lib/utils";
import type { ShopProduct } from "@/components/shop/shop-card";

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

export const revalidate = 60; // Incremental Static Regeneration: Edge CDN cached, instant loading

async function getShopProducts(): Promise<ShopProduct[]> {
  try {
    await connectDB();
    const rawProducts = await Product.find({ status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    return rawProducts.map((p: any) => {
      const originalPrice = Number(p.originalPrice ?? p.price ?? 0);
      const discountedPrice = Number(p.discountedPrice ?? p.price ?? originalPrice);
      const percentageOff = calculateDiscountPercentage(originalPrice, discountedPrice);

      return {
        _id: String(p._id),
        name: p.name,
        originalPrice,
        discountedPrice,
        percentageOff,
        fabric: p.fabric || "",
        description: p.description || "",
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        sizeStock: Array.isArray(p.sizeStock) ? p.sizeStock : [],
        images: Array.isArray(p.images) ? p.images : [],
        status: p.status || "active",
        isFeatured: Boolean(p.isFeatured),
        createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error("Failed to pre-load shop products on server:", err);
    return [];
  }
}

export default async function ShopPage() {
  const initialProducts = await getShopProducts();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Customer-Facing Navbar */}
      <Navbar />

      {/* Main Shop Section with Server-Pre-rendered products for zero-blank-screen display */}
      <main className="flex-1">
        <Suspense fallback={null}>
          <ShopContainer initialProducts={initialProducts} />
        </Suspense>
      </main>

      {/* Customer-Facing Footer */}
      <Footer />
    </div>
  );
}
