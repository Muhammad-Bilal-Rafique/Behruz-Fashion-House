import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product identifier is required." },
        { status: 400 }
      );
    }

    await connectDB();

    let p: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      p = await Product.findById(id).lean();
    }
    if (!p) {
      p = await Product.findOne({ slug: id }).lean();
    }

    if (!p || p.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Product not found or unavailable." },
        { status: 404 }
      );
    }

    const originalPrice = Number(p.originalPrice || 0);
    const discountedPrice = p.discountedPrice ? Number(p.discountedPrice) : null;
    let discountPercentage = 0;
    if (discountedPrice && originalPrice > discountedPrice) {
      discountPercentage = Math.round(
        ((originalPrice - discountedPrice) / originalPrice) * 100
      );
    }

    const product = {
      _id: String(p._id),
      name: p.name,
      slug: p.slug,
      description: p.description,
      fabric: p.fabric,
      originalPrice,
      discountedPrice,
      discountPercentage,
      images: p.images || [],
      sizeStock: p.sizeStock || [],
      category: p.category,
      isFeatured: Boolean(p.isFeatured),
      status: p.status,
      createdAt: p.createdAt,
    };

    return NextResponse.json(
      { success: true, product },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("Public product detail error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product details." },
      { status: 500 }
    );
  }
}
