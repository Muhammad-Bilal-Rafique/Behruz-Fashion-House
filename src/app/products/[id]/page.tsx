import { Metadata } from "next";
import mongoose from "mongoose";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import { calculateDiscountPercentage } from "@/lib/utils";
import ProductDetailContainer from "@/components/products/product-detail-container";
import type { ShopProduct } from "@/components/shop/shop-card";

// Dynamic Server Rendering: 0-second cache ensures 100% live inventory on every visit
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Fetch full product server-side directly from MongoDB (takes ~15-20ms).
 * Guarantees zero blank screen and 100% real-time stock.
 */
async function getFullProduct(id: string): Promise<ShopProduct | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  try {
    await connectDB();
    const raw = await Product.findById(id).lean();
    if (!raw) return null;

    const p = raw as any;
    if (p.status === "draft") {
      return null;
    }

    const originalPrice = Number(p.originalPrice ?? p.price ?? 0);
    const discountedPrice = Number(p.discountedPrice ?? p.price ?? originalPrice);
    const percentageOff = calculateDiscountPercentage(originalPrice, discountedPrice);

    return {
      _id: String(p._id),
      name: p.name,
      originalPrice,
      discountedPrice,
      percentageOff,
      description: p.description || "",
      fabric: p.fabric || "",
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      sizeStock: Array.isArray(p.sizeStock) ? p.sizeStock : [],
      images: Array.isArray(p.images) ? p.images : [],
      status: p.status || "active",
      isFeatured: Boolean(p.isFeatured),
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error retrieving full product on server:", error);
    return null;
  }
}

/**
 * Fetch 4 related active products server-side
 */
async function getRelatedProducts(excludeId: string): Promise<ShopProduct[]> {
  try {
    await connectDB();
    const raw = await Product.find({
      status: "active",
      _id: { $ne: excludeId },
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return raw.map((p: any) => {
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
  } catch (error) {
    console.error("Error retrieving related products on server:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getFullProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | Behruz Fashion House",
      description: "The requested luxury couture article could not be found.",
    };
  }

  const coverImage =
    product.images.find((img) => img.isCover)?.url ||
    product.images[0]?.url;

  return {
    title: `${product.name} | Behruz Fashion House`,
    description:
      product.description.slice(0, 160) ||
      `Explore ${product.name} from Behruz Fashion House luxury pret & couture.`,
    openGraph: {
      title: `${product.name} | Behruz Fashion House`,
      description: product.description.slice(0, 160),
      images: coverImage ? [{ url: coverImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [product, relatedProducts] = await Promise.all([
    getFullProduct(id),
    getRelatedProducts(id),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#FF3154]/20 selection:text-[#FF3154]">
      {/* Customer-Facing Navbar */}
      <Navbar />

      {/* Main Content with Server-Rendered product data (Zero skeleton, zero blank screen) */}
      <main className="flex-1">
        <ProductDetailContainer
          id={id}
          initialProduct={product}
          initialRelatedProducts={relatedProducts}
        />
      </main>

      {/* Customer-Facing Footer */}
      <Footer />
    </div>
  );
}
