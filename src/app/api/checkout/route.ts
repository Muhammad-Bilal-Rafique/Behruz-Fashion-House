import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getStoreSettings } from "@/lib/store-settings-server";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  sendOrderPlacedCustomerEmail,
  sendOrderPlacedAdminNotification,
} from "@/lib/email";

interface CheckoutRequestBody {
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    country: string;
    province: string;
    city: string;
    address: string;
  };
  items: {
    productId: string;
    size: string;
    quantity: number;
  }[];
}

export async function POST(request: NextRequest) {
  let reservedItems: { productId: string; size: string; quantity: number }[] = [];
  try {
    // 0. Rate limiting (10 checkout attempts per 10 minutes per IP)
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "checkout_client";
    const rateLimit = checkRateLimit(`checkout_${clientIp}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many checkout attempts. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const body: any = await request.json();
    const customer = body.customer || {
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      country: body.country,
      province: body.province,
      city: body.city,
      address: body.address,
    };
    const items = body.items;

    // 1. Validate Customer Data
    if (!customer || (!customer.fullName && !body.fullName)) {
      return NextResponse.json(
        { success: false, error: "Customer information is required." },
        { status: 400 }
      );
    }

    const fullName = customer.fullName?.trim();
    const phone = customer.phone?.trim();
    const country = customer.country?.trim();
    const province = customer.province?.trim();
    const city = customer.city?.trim();
    const address = customer.address?.trim();
    const email = customer.email?.trim() || "";

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!phone || phone.length < 7) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid phone/WhatsApp number." },
        { status: 400 }
      );
    }

    if (!country) {
      return NextResponse.json(
        { success: false, error: "Country is required." },
        { status: 400 }
      );
    }

    if (!province) {
      return NextResponse.json(
        { success: false, error: "Province/State is required." },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { success: false, error: "City is required." },
        { status: 400 }
      );
    }

    if (!address || address.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please provide a detailed shipping address." },
        { status: 400 }
      );
    }

    // 2. Validate Items Array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your bag is empty. Please add items to checkout." },
        { status: 400 }
      );
    }

    // Sanitize items
    const sanitizedItems: { productId: string; size: string; quantity: number }[] = [];
    for (const item of items) {
      if (
        !item.productId ||
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !item.size ||
        !item.quantity ||
        item.quantity < 1
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid item in cart." },
          { status: 400 }
        );
      }
      sanitizedItems.push({
        productId: item.productId,
        size: item.size.trim(),
        quantity: Math.floor(item.quantity),
      });
    }

    await connectDB();

    // 3. Fetch products directly from MongoDB (Do NOT trust client prices or stock)
    const productIds = Array.from(new Set(sanitizedItems.map((i) => i.productId)));
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map<string, any>();
    products.forEach((p) => productMap.set(String(p._id), p));

    // Check all products exist and are active
    for (const item of sanitizedItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `One of the items in your bag is no longer available. Please return to bag.`,
          },
          { status: 400 }
        );
      }

      if (product.status !== "active") {
        return NextResponse.json(
          {
            success: false,
            error: `"${product.name}" is currently unavailable for purchase.`,
          },
          { status: 400 }
        );
      }

      const sizeEntry = Array.isArray(product.sizeStock)
        ? product.sizeStock.find((s: any) => s.size === item.size)
        : null;

      if (!sizeEntry) {
        return NextResponse.json(
          {
            success: false,
            error: `Size "${item.size}" is not available for "${product.name}".`,
          },
          { status: 400 }
        );
      }

      if (sizeEntry.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Requested quantity for "${product.name}" (Size: ${item.size}) exceeds available stock (${sizeEntry.stock} left).`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Calculate Server-Side Pricing
    let subtotal = 0;
    const orderItemsSnapshot: any[] = [];

    for (const item of sanitizedItems) {
      const product = productMap.get(item.productId);
      const unitPrice = Number(product.discountedPrice ?? product.originalPrice ?? 0);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      const coverImage =
        product.images?.find((img: any) => img.isCover)?.url ||
        product.images?.[0]?.url ||
        "";

      orderItemsSnapshot.push({
        productId: product._id,
        name: product.name,
        image: coverImage,
        size: item.size,
        quantity: item.quantity,
        price: unitPrice,
        itemTotal,
      });
    }

    // 5. Calculate Shipping & Delivery Time
    const isPakistan = country.toLowerCase() === "pakistan";
    const settings = await getStoreSettings();
    let shippingFee = 0;
    let shippingType: "punjab" | "pakistan_other" | "international_weight_based" =
      "pakistan_other";
    let deliveryEstimate = settings.deliveryEstimate || "3–5 business days";
    let paymentMethod: "cash_on_delivery" | "international_pending" = "cash_on_delivery";

    if (isPakistan) {
      const isPunjab = province.toLowerCase().includes("punjab");
      const isFreeShipping =
        settings.freeShippingThreshold > 0 &&
        subtotal >= settings.freeShippingThreshold;

      shippingType = isPunjab ? "punjab" : "pakistan_other";
      if (isFreeShipping) {
        shippingFee = 0;
      } else if (isPunjab) {
        shippingFee = settings.punjabShippingFee;
      } else {
        shippingFee = settings.otherPakistanShippingFee;
      }
      deliveryEstimate = settings.deliveryEstimate || "3–5 business days";
      paymentMethod = "cash_on_delivery";
    } else {
      // International shipping is weight-based and calculated separately
      shippingFee = 0;
      shippingType = "international_weight_based";
      deliveryEstimate = "10 business days";
      paymentMethod = "international_pending";
    }

    const total = subtotal + shippingFee;

    // 6. Concurrency-Safe Atomic Stock Decrement
    // If any item cannot be decremented atomically (e.g. purchased simultaneously), rollback and abort.
    for (const item of sanitizedItems) {
      const updateResult = await Product.updateOne(
        {
          _id: item.productId,
          status: "active",
          sizeStock: {
            $elemMatch: {
              size: item.size,
              stock: { $gte: item.quantity },
            },
          },
        },
        {
          $inc: { "sizeStock.$.stock": -item.quantity },
        }
      );

      if (updateResult.modifiedCount === 0) {
        // Atomic decrement failed! Roll back all previously reserved items
        for (const reserved of reservedItems) {
          await Product.updateOne(
            { _id: reserved.productId, "sizeStock.size": reserved.size },
            { $inc: { "sizeStock.$.stock": reserved.quantity } }
          );
        }

        const product = productMap.get(item.productId);
        return NextResponse.json(
          {
            success: false,
            error: `Sorry, "${product?.name || "a product"}" (Size: ${item.size}) just sold out or has insufficient stock. Please update your bag.`,
          },
          { status: 409 }
        );
      }

      reservedItems.push(item);
    }

    // 7. Generate Collision-Resistant Order Number & Access Token
    const dateStr = new Date().toISOString().slice(2, 7).replace("-", ""); // e.g. "2609"
    let orderNumber = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      const hexSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
      const candidate = `BFH-${dateStr}-${hexSuffix}`;
      const existing = await Order.findOne({ orderNumber: candidate });
      if (!existing) {
        orderNumber = candidate;
        break;
      }
    }
    if (!orderNumber) {
      orderNumber = `BFH-${dateStr}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    }

    const customerAccessToken = crypto.randomBytes(24).toString("hex");

    const advanceAmount = settings.advancePaymentAmount;
    const remainingAmount = isPakistan
      ? Math.max(0, total - advanceAmount)
      : Math.max(0, subtotal - advanceAmount);

    const newOrder = await Order.create({
      orderNumber,
      customerAccessToken,
      isStockRestocked: false,
      customer: {
        name: fullName,
        phone,
        email,
        country,
        province,
        city,
        address,
      },
      items: orderItemsSnapshot,
      pricing: {
        subtotal,
        shippingFee,
        shippingType,
        total,
        advanceAmount,
        remainingAmount,
      },
      shipping: {
        country,
        province,
        deliveryEstimate,
        status: "pending",
      },
      payment: {
        method: paymentMethod,
        status: "pending",
        advanceAmount,
        advancePaymentStatus: "pending",
      },
      orderStatus: "awaiting_advance",
    });

    // 8. Trigger Email Notifications Asynchronously (Non-blocking)
    const emailData = {
      orderNumber: newOrder.orderNumber,
      customer: {
        name: newOrder.customer.name,
        phone: newOrder.customer.phone,
        email: newOrder.customer.email,
        country: newOrder.customer.country,
        province: newOrder.customer.province,
        city: newOrder.customer.city,
        address: newOrder.customer.address,
      },
      pricing: {
        subtotal: newOrder.pricing.subtotal,
        shippingFee: newOrder.pricing.shippingFee,
        shippingType: newOrder.pricing.shippingType,
        total: newOrder.pricing.total,
        advanceAmount: newOrder.pricing.advanceAmount,
        remainingAmount: newOrder.pricing.remainingAmount,
      },
      shipping: {
        deliveryEstimate: newOrder.shipping.deliveryEstimate,
      },
      items: newOrder.items.map((it: any) => ({
        name: it.name,
        size: it.size,
        quantity: it.quantity,
        price: it.price,
        itemTotal: it.itemTotal,
      })),
    };

    Promise.allSettled([
      sendOrderPlacedCustomerEmail(emailData),
      sendOrderPlacedAdminNotification(emailData),
    ]).catch((err) => console.error("Error dispatching checkout emails:", err));

    return NextResponse.json({
      success: true,
      order: {
        orderId: String(newOrder._id),
        orderNumber: newOrder.orderNumber,
        customerAccessToken: newOrder.customerAccessToken,
        customer: newOrder.customer,
        pricing: newOrder.pricing,
        shipping: newOrder.shipping,
        payment: newOrder.payment,
        orderStatus: newOrder.orderStatus,
        items: newOrder.items,
        createdAt: newOrder.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);

    // Concurrency / crash stock rollback
    if (Array.isArray(reservedItems) && reservedItems.length > 0) {
      for (const reserved of reservedItems) {
        try {
          await Product.updateOne(
            { _id: reserved.productId, "sizeStock.size": reserved.size },
            { $inc: { "sizeStock.$.stock": reserved.quantity } }
          );
        } catch (rollbackErr) {
          console.error("Failed to rollback stock for item:", reserved, rollbackErr);
        }
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "We encountered an issue processing your order. Please try again or contact us on WhatsApp.",
      },
      { status: 500 }
    );
  }
}
