import { Metadata } from "next";
import mongoose from "mongoose";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import ProductDetailContainer from "@/components/products/product-detail-container";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server-side helper to fetch metadata for SEO.
 * Draft products are strictly treated as not found.
 */
async function getProductForMetadata(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  try {
    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) return null;

    const p = product as any;
    // Draft products are never exposed to search engines or customers
    if (p.status === "draft") {
      return null;
    }

    return {
      name: p.name,
      description: p.description || "",
      images: Array.isArray(p.images) ? p.images : [],
    };
  } catch (error) {
    console.error("Error retrieving metadata for product:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductForMetadata(id);

  if (!product) {
    return {
      title: "Product Not Found | Behruz Fashion House",
      description: "The requested luxury couture article could not be found.",
    };
  }

  const coverImage =
    product.images.find((img: any) => img.isCover)?.url ||
    product.images[0]?.url;

  return {
    title: `${product.name} | Behruz Fashion House`,
    description: product.description.slice(0, 160) || `Explore ${product.name} from Behruz Fashion House luxury pret & couture.`,
    openGraph: {
      title: `${product.name} | Behruz Fashion House`,
      description: product.description.slice(0, 160),
      images: coverImage ? [{ url: coverImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#FF3154]/20 selection:text-[#FF3154]">
      {/* Customer-Facing Navbar */}
      <Navbar />

      {/* Main Content: Client container with dynamic loading, skeleton, 404, error, and related products */}
      <main className="flex-1">
        <ProductDetailContainer id={id} />
      </main>

      {/* Customer-Facing Footer */}
      <Footer />
    </div>
  );
}
