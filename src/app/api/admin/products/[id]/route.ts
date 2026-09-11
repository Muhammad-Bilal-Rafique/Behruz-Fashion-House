import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { calculateDiscountPercentage } from "@/lib/utils";

// Helper to validate ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET: Fetch a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID." },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const p = product as any;
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    // Draft products must NEVER be exposed publicly to customers
    if (p.status === "draft" && !includeDrafts) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const originalPrice = Number(p.originalPrice ?? p.price ?? 0);
    const discountedPrice = Number(p.discountedPrice ?? p.price ?? originalPrice);
    const percentageOff = calculateDiscountPercentage(originalPrice, discountedPrice);

    return NextResponse.json({
      success: true,
      product: {
        ...p,
        originalPrice,
        discountedPrice,
        percentageOff,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product." },
      { status: 500 }
    );
  }
}

// PUT: Update an existing product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID." },
        { status: 400 }
      );
    }

    await connectDB();
    const body = await request.json();

    const {
      name,
      originalPrice,
      discountedPrice,
      fabric,
      description,
      sizes,
      sizeStock,
      status,
      isFeatured,
    } = body;

    const updateFields: Record<string, any> = {};

    if (name !== undefined) {
      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, error: "Product name cannot be empty." },
          { status: 400 }
        );
      }
      updateFields.name = name.trim();
    }

    if (originalPrice !== undefined) {
      const num = Number(originalPrice);
      if (isNaN(num) || num <= 0) {
        return NextResponse.json(
          { success: false, error: "Original price must be greater than 0." },
          { status: 400 }
        );
      }
      updateFields.originalPrice = num;
    }

    if (discountedPrice !== undefined) {
      const num = Number(discountedPrice);
      if (isNaN(num) || num <= 0) {
        return NextResponse.json(
          { success: false, error: "Discounted price must be greater than 0." },
          { status: 400 }
        );
      }
      updateFields.discountedPrice = num;
    }

    // Price relationship validation
    if (updateFields.originalPrice !== undefined || updateFields.discountedPrice !== undefined) {
      const existingProduct = await Product.findById(id).lean();
      if (!existingProduct) {
        return NextResponse.json(
          { success: false, error: "Product not found." },
          { status: 404 }
        );
      }
      const finalOriginal =
        updateFields.originalPrice ?? (existingProduct as any).originalPrice ?? (existingProduct as any).price;
      const finalDiscounted =
        updateFields.discountedPrice ?? (existingProduct as any).discountedPrice ?? (existingProduct as any).price;

      if (finalDiscounted > finalOriginal) {
        return NextResponse.json(
          {
            success: false,
            error: "Discounted price cannot be greater than original price.",
          },
          { status: 400 }
        );
      }
    }

    if (fabric !== undefined) {
      updateFields.fabric = String(fabric).trim();
    }

    if (description !== undefined) {
      if (!description || typeof description !== "string" || !description.trim()) {
        return NextResponse.json(
          { success: false, error: "Description cannot be empty." },
          { status: 400 }
        );
      }
      updateFields.description = description.trim();
    }

    if (sizes !== undefined) {
      if (!Array.isArray(sizes) || sizes.length === 0) {
        return NextResponse.json(
          { success: false, error: "At least one size is required." },
          { status: 400 }
        );
      }
      updateFields.sizes = sizes;
    }

    if (sizeStock !== undefined) {
      if (Array.isArray(sizeStock)) {
        updateFields.sizeStock = sizeStock.map((item: any) => ({
          size: String(item.size).trim(),
          stock: Math.max(0, parseInt(item.stock, 10) || 0),
        }));
      }
    }

    if (status !== undefined) {
      updateFields.status = status === "draft" ? "draft" : "active";
    }

    if (isFeatured !== undefined) {
      updateFields.isFeatured = Boolean(isFeatured);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const p = updatedProduct as any;
    const finalOrig = Number(p.originalPrice ?? 0);
    const finalDisc = Number(p.discountedPrice ?? finalOrig);
    const percentageOff = calculateDiscountPercentage(finalOrig, finalDisc);

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: {
        ...p,
        percentageOff,
      },
    });
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a product and its images from Cloudinary
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID." },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    // Clean up images in Cloudinary
    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.publicId) {
          try {
            await deleteFromCloudinary(img.publicId);
          } catch (cloudErr) {
            console.error(`Failed to delete image ${img.publicId} from Cloudinary:`, cloudErr);
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product and associated images deleted successfully.",
    });
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product." },
      { status: 500 }
    );
  }
}
