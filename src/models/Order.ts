import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId | string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
  itemTotal: number;
}

export interface IOrderCustomer {
  name: string;
  phone: string;
  email?: string;
  country: string;
  province: string;
  city: string;
  address: string;
}

export interface IOrderPricing {
  subtotal: number;
  shippingFee: number;
  shippingType: "punjab" | "pakistan_other" | "international_weight_based";
  total: number;
}

export interface IOrderShipping {
  country: string;
  province: string;
  deliveryEstimate: string;
  status: "pending" | "processing" | "dispatched" | "delivered" | "cancelled";
}

export interface IOrderPayment {
  method: "cash_on_delivery" | "international_pending";
  status: "pending" | "paid" | "failed";
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: IOrderCustomer;
  items: IOrderItem[];
  pricing: IOrderPricing;
  shipping: IOrderShipping;
  payment: IOrderPayment;
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    itemTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderCustomerSchema = new Schema<IOrderCustomer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    country: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OrderPricingSchema = new Schema<IOrderPricing>(
  {
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    shippingType: {
      type: String,
      enum: ["punjab", "pakistan_other", "international_weight_based"],
      required: true,
    },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderShippingSchema = new Schema<IOrderShipping>(
  {
    country: { type: String, required: true },
    province: { type: String, required: true },
    deliveryEstimate: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "dispatched", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { _id: false }
);

const OrderPaymentSchema = new Schema<IOrderPayment>(
  {
    method: {
      type: String,
      enum: ["cash_on_delivery", "international_pending"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customer: { type: OrderCustomerSchema, required: true },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => Array.isArray(v) && v.length > 0,
        message: "Order must contain at least one item.",
      },
    },
    pricing: { type: OrderPricingSchema, required: true },
    shipping: { type: OrderShippingSchema, required: true },
    payment: { type: OrderPaymentSchema, required: true },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
