import { Metadata } from "next";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { EditProductForm } from "@/components/admin/products/edit-product-form";
import type { SerializedProduct } from "@/components/admin/products/product-row";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { title: "Product Not Found | Admin | Behruz Fashion House" };
  }

  try {
    await connectDB();
    const product = await Product.findById(id).select("name").lean();
    if (!product) {
      return { title: "Product Not Found | Admin | Behruz Fashion House" };
    }
    return {
      title: `Edit ${product.name} | Admin | Behruz Fashion House`,
      description: `Edit product details and pricing for ${product.name}.`,
    };
  } catch {
    return { title: "Edit Product | Admin | Behruz Fashion House" };
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();
  const rawProduct = await Product.findById(id).lean();

  if (!rawProduct) {
    notFound();
  }

  const p = rawProduct as any;
  const serializedProduct: SerializedProduct = {
    _id: String(p._id),
    name: p.name || "",
    originalPrice: Number(p.originalPrice ?? p.price ?? 0),
    discountedPrice: Number(p.discountedPrice ?? p.price ?? p.originalPrice ?? 0),
    description: p.description || "",
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    sizeStock: Array.isArray(p.sizeStock)
      ? p.sizeStock.map((s: any) => ({ size: String(s.size), stock: Number(s.stock) || 0 }))
      : (p.sizes || []).map((s: string) => ({ size: s, stock: 10 })),
    images: Array.isArray(p.images)
      ? p.images.map((img: any) => ({
          url: img.url,
          publicId: img.publicId,
          isCover: Boolean(img.isCover),
        }))
      : [],
    status: p.status === "draft" ? "draft" : "active",
    isFeatured: Boolean(p.isFeatured),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-20 selection:bg-primary/20 selection:text-primary">
      {/* Top Admin Navbar */}
      <AdminNavbar />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary font-medium mb-1">
            <span>PRODUCT MANAGEMENT</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
            Edit Product
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Modify product information, update sizes & inventory stock, or change store visibility.
          </p>
        </div>

        <EditProductForm product={serializedProduct} />
      </main>
    </div>
  );
}
