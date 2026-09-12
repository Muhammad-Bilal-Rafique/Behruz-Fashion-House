import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";

interface CheckItemInput {
  productId: string;
  size: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: CheckItemInput[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No items provided for validation." },
        { status: 400 }
      );
    }

    await connectDB();

    const productIds = items
      .map((i) => i.productId)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map<string, any>();
    products.forEach((p) => productMap.set(String(p._id), p));

    let hasIssues = false;

    const validatedItems = items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        hasIssues = true;
        return {
          productId: item.productId,
          size: item.size,
          requestedQuantity: item.quantity,
          availableStock: 0,
          currentPrice: 0,
          name: "Unavailable Product",
          status: "not_found" as const,
          message: "This product is no longer available.",
        };
      }

      if (product.status !== "active") {
        hasIssues = true;
        return {
          productId: item.productId,
          size: item.size,
          requestedQuantity: item.quantity,
          availableStock: 0,
          currentPrice: Number(product.discountedPrice || product.originalPrice || 0),
          name: product.name,
          status: "inactive" as const,
          message: "This piece is currently not available for purchase.",
        };
      }

      // Check sizeStock array
      const sizeEntry = Array.isArray(product.sizeStock)
        ? product.sizeStock.find((s: any) => s.size === item.size)
        : null;

      const availableStock = sizeEntry ? Number(sizeEntry.stock || 0) : 0;
      const currentPrice = Number(product.discountedPrice || product.originalPrice || 0);

      if (availableStock <= 0) {
        hasIssues = true;
        return {
          productId: item.productId,
          size: item.size,
          requestedQuantity: item.quantity,
          availableStock: 0,
          currentPrice,
          name: product.name,
          status: "out_of_stock" as const,
          message: `Size ${item.size} is completely sold out.`,
        };
      }

      if (item.quantity > availableStock) {
        hasIssues = true;
        return {
          productId: item.productId,
          size: item.size,
          requestedQuantity: item.quantity,
          availableStock,
          currentPrice,
          name: product.name,
          status: "insufficient_stock" as const,
          message: `Only ${availableStock} piece${availableStock > 1 ? "s" : ""} left in size ${item.size}.`,
        };
      }

      return {
        productId: item.productId,
        size: item.size,
        requestedQuantity: item.quantity,
        availableStock,
        currentPrice,
        name: product.name,
        status: "valid" as const,
        message: "In stock",
      };
    });

    return NextResponse.json({
      success: true,
      hasIssues,
      items: validatedItems,
    });
  } catch (error) {
    console.error("Error in validate-stock route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate stock availability." },
      { status: 500 }
    );
  }
}
