import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const category = request.nextUrl.searchParams.get("category");
    const featured = request.nextUrl.searchParams.get("featured");

    const query: any = { status: "active" };

    if (category && category !== "all") {
      query.category = category;
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    const rawProducts = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const products = rawProducts.map((p: any) => {
      const originalPrice = Number(p.originalPrice || 0);
      const discountedPrice = p.discountedPrice ? Number(p.discountedPrice) : null;
      let discountPercentage = 0;
      if (discountedPrice && originalPrice > discountedPrice) {
        discountPercentage = Math.round(
          ((originalPrice - discountedPrice) / originalPrice) * 100
        );
      }

      return {
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
    });

    return NextResponse.json(
      { success: true, count: products.length, products },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("Public products API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}
