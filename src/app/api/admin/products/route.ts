import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { calculateDiscountPercentage } from "@/lib/utils";

import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET: Fetch all products (sorted newest first) with derived percentageOff, optional limit & exclude
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(100, Math.max(0, parseInt(searchParams.get("limit") || "0", 10)));
    const exclude = searchParams.get("exclude");

    const query: Record<string, any> = {};
    if (status) {
      query.status = status;
    }
    if (exclude) {
      query._id = { $ne: exclude };
    }

    let queryBuilder = Product.find(query).sort({ createdAt: -1 });
    if (limit > 0) {
      queryBuilder = queryBuilder.limit(limit);
    }

    const rawProducts = await queryBuilder.lean();

    // Map products to include derived percentageOff and ensure robust fields
    const products = rawProducts.map((p: any) => {
      const originalPrice = Number(p.originalPrice ?? p.price ?? 0);
      const discountedPrice = Number(p.discountedPrice ?? p.price ?? originalPrice);
      const percentageOff = calculateDiscountPercentage(originalPrice, discountedPrice);

      return {
        ...p,
        originalPrice,
        discountedPrice,
        percentageOff,
      };
    });

    return NextResponse.json(
      { success: true, products },
      {
        headers: {
          "Cache-Control": status === "active" ? "public, s-maxage=60, stale-while-revalidate=120" : "no-store",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: Upload images to Cloudinary and create Product in MongoDB
export async function POST(request: NextRequest) {
  const uploadedCloudinaryImages: { url: string; publicId: string; isCover: boolean }[] = [];

  try {
    const [, formData] = await Promise.all([
      connectDB(),
      request.formData(),
    ]);

    const name = (formData.get("name") as string)?.trim();
    const originalPriceStr = formData.get("originalPrice") as string;
    const discountedPriceStr = formData.get("discountedPrice") as string;
    const fabric = (formData.get("fabric") as string)?.trim() || "";
    const description = (formData.get("description") as string)?.trim();
    const status = (formData.get("status") as string) || "active";
    const isFeatured = formData.get("isFeatured") === "true";

    // Handle sizes (can be JSON array string or individual form entries)
    let sizes: string[] = [];
    const sizesRaw = formData.get("sizes");
    if (typeof sizesRaw === "string") {
      try {
        sizes = JSON.parse(sizesRaw);
      } catch {
        sizes = formData.getAll("sizes").map((s) => String(s).trim()).filter(Boolean);
      }
    } else {
      sizes = formData.getAll("sizes").map((s) => String(s).trim()).filter(Boolean);
    }

    // Handle stock per size (sizeStock)
    let sizeStock: { size: string; stock: number }[] = [];
    const sizeStockRaw = formData.get("sizeStock");
    if (typeof sizeStockRaw === "string") {
      try {
        const parsed = JSON.parse(sizeStockRaw);
        if (Array.isArray(parsed)) {
          sizeStock = parsed.map((item) => ({
            size: String(item.size).trim(),
            stock: Math.max(0, parseInt(item.stock, 10) || 0),
          }));
        }
      } catch {
        // Ignore JSON parse error and fallback
      }
    }

    // Ensure all selected sizes have a corresponding stock entry
    if (sizeStock.length === 0 && sizes.length > 0) {
      sizeStock = sizes.map((s) => ({ size: s, stock: 5 }));
    }

    // Handle uploaded image files
    const imageFiles = (formData.getAll("images") as File[]).filter(
      (file) => file && typeof file === "object" && file.size > 0
    );

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Product name is required." },
        { status: 400 }
      );
    }

    const originalPrice = Number(originalPriceStr);
    if (isNaN(originalPrice) || originalPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive original price is required." },
        { status: 400 }
      );
    }

    const discountedPrice = Number(discountedPriceStr);
    if (isNaN(discountedPrice) || discountedPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive discounted price is required." },
        { status: 400 }
      );
    }

    if (discountedPrice > originalPrice) {
      return NextResponse.json(
        {
          success: false,
          error: "Discounted price cannot be greater than original price.",
        },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, error: "Description is required." },
        { status: 400 }
      );
    }

    if (!sizes || sizes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least one size." },
        { status: 400 }
      );
    }

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please upload at least one product image." },
        { status: 400 }
      );
    }

    // 1. Upload each image file to Cloudinary in parallel
    const uploadPromises = imageFiles.map(async (file, i) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploaded = await uploadToCloudinary(buffer, "behruz-fashion/products");
      return {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        isCover: i === 0, // First uploaded image is marked as cover
      };
    });

    const uploadResults = await Promise.all(uploadPromises);
    uploadedCloudinaryImages.push(...uploadResults);


    // 2. Save new Product document in MongoDB with sizeStock
    const newProduct = await Product.create({
      name,
      originalPrice,
      discountedPrice,
      fabric,
      description,
      sizes,
      sizeStock,
      images: uploadedCloudinaryImages,
      status: status === "draft" ? "draft" : "active",
      isFeatured,
    });

    const percentageOff = calculateDiscountPercentage(originalPrice, discountedPrice);

    try {
      revalidatePath("/shop");
      revalidatePath("/");
    } catch (revalErr) {
      console.error("Path revalidation error:", revalErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: {
          ...newProduct.toObject(),
          percentageOff,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);

    // Rollback: delete uploaded images from Cloudinary if MongoDB saving failed
    if (uploadedCloudinaryImages.length > 0) {
      for (const img of uploadedCloudinaryImages) {
        try {
          await deleteFromCloudinary(img.publicId);
        } catch (cleanupErr) {
          console.error("Failed to clean up uploaded Cloudinary image:", cleanupErr);
        }
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create product.",
      },
      { status: 500 }
    );
  }
}
