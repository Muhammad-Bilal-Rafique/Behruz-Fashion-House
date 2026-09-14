"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { getCurrentAdminSession } from "@/app/admin/login/actions";

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Delete a product from MongoDB and remove all associated Cloudinary images.
 */
export async function deleteProductAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentAdminSession();
    if (!session || !session.authenticated) {
      return { success: false, error: "Unauthorized. Admin session required." };
    }

    if (!id || !isValidObjectId(id)) {
      return { success: false, error: "Invalid product ID." };
    }

    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return { success: false, error: "Product not found or already deleted." };
    }

    // Safely delete Cloudinary images belonging strictly to this product
    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.publicId) {
          try {
            await deleteFromCloudinary(img.publicId);
          } catch (cloudErr) {
            console.error(`Failed to delete Cloudinary asset ${img.publicId}:`, cloudErr);
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    // Revalidate customer and admin routes
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath(`/products/${id}`);

    return { success: true };
  } catch (error: any) {
    console.error("deleteProductAction error:", error);
    return { success: false, error: error.message || "Failed to delete product." };
  }
}

/**
 * Toggle product status between active and draft.
 */
export async function toggleProductStatusAction(
  id: string,
  newStatus: "active" | "draft"
): Promise<{ success: boolean; error?: string; status?: "active" | "draft" }> {
  try {
    const session = await getCurrentAdminSession();
    if (!session || !session.authenticated) {
      return { success: false, error: "Unauthorized. Admin session required." };
    }

    if (!id || !isValidObjectId(id)) {
      return { success: false, error: "Invalid product ID." };
    }

    if (newStatus !== "active" && newStatus !== "draft") {
      return { success: false, error: "Status must be 'active' or 'draft'." };
    }

    await connectDB();
    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: { status: newStatus } },
      { new: true }
    ).lean();

    if (!updated) {
      return { success: false, error: "Product not found." };
    }

    // Revalidate customer and admin routes
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath(`/products/${id}`);

    return { success: true, status: updated.status as "active" | "draft" };
  } catch (error: any) {
    console.error("toggleProductStatusAction error:", error);
    return { success: false, error: error.message || "Failed to update product status." };
  }
}

/**
 * Toggle whether a product is featured on the homepage.
 */
export async function toggleProductFeaturedAction(
  id: string,
  newFeatured: boolean
): Promise<{ success: boolean; error?: string; isFeatured?: boolean }> {
  try {
    const session = await getCurrentAdminSession();
    if (!session || !session.authenticated) {
      return { success: false, error: "Unauthorized. Admin session required." };
    }

    if (!id || !isValidObjectId(id)) {
      return { success: false, error: "Invalid product ID." };
    }

    await connectDB();
    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: { isFeatured: Boolean(newFeatured) } },
      { new: true }
    ).lean();

    if (!updated) {
      return { success: false, error: "Product not found." };
    }

    // Revalidate customer storefront and admin
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath(`/products/${id}`);

    return { success: true, isFeatured: Boolean(updated.isFeatured) };
  } catch (error: any) {
    console.error("toggleProductFeaturedAction error:", error);
    return { success: false, error: error.message || "Failed to update featured status." };
  }
}
