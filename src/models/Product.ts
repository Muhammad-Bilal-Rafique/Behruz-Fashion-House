import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductImage {
  url: string;
  publicId: string;
  isCover: boolean;
}

export interface ISizeStock {
  size: string;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  description: string;
  sizes: string[];
  sizeStock?: ISizeStock[];
  images: IProductImage[];
  status: "active" | "draft";
  isFeatured: boolean;
  fabric?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isCover: { type: Boolean, default: false },
  },
  { _id: false }
);

const SizeStockSchema = new Schema<ISizeStock>(
  {
    size: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
      min: [1, "Original price must be greater than 0"],
    },
    discountedPrice: {
      type: Number,
      required: [true, "Discounted price is required"],
      min: [1, "Discounted price must be greater than 0"],
      validate: {
        validator: function (this: any, val: number) {
          // If originalPrice is provided, discountedPrice cannot exceed it
          const original = this.originalPrice ?? (this.get ? this.get("originalPrice") : undefined);
          if (original !== undefined && original !== null) {
            return val <= original;
          }
          return true;
        },
        message: "Discounted price cannot be greater than original price",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    sizes: {
      type: [String],
      required: [true, "At least one size is required"],
      validate: {
        validator: (val: string[]) => Array.isArray(val) && val.length > 0,
        message: "At least one size is required",
      },
      default: [],
    },
    sizeStock: {
      type: [SizeStockSchema],
      default: [],
    },
    images: {
      type: [ProductImageSchema],
      required: [true, "At least one image is required"],
      validate: {
        validator: (val: IProductImage[]) => Array.isArray(val) && val.length > 0,
        message: "At least one product image is required",
      },
    },
    status: {
      type: String,
      enum: ["active", "draft"],
      default: "active",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    fabric: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Clear model cache in development to ensure schema changes are applied immediately
if (mongoose.models && mongoose.models.Product) {
  delete mongoose.models.Product;
}

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

