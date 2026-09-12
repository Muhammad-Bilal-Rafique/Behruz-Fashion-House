import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/connect";
import Product from "@/models/Product";
import Order from "@/models/Order";

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
  try {
    const body: CheckoutRequestBody = await request.json();
    const { customer, items } = body;

    // 1. Validate Customer Data
    if (!customer) {
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
        { success: false, error: "Please select your country." },
        { status: 400 }
      );
    }

    if (!province) {
      return NextResponse.json(
        { success: false, error: "Please select or enter your province/state." },
        { status: 400 }
      );
    }

    if (!city || city.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your city." },
        { status: 400 }
      );
    }

    if (!address || address.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please enter your complete delivery address." },
        { status: 400 }
      );
    }

    // 2. Validate Cart Items
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
    let shippingFee = 0;
    let shippingType: "punjab" | "pakistan_other" | "international_weight_based" =
      "pakistan_other";
    let deliveryEstimate = "3–5 business days";
    let paymentMethod: "cash_on_delivery" | "international_pending" = "cash_on_delivery";

    if (isPakistan) {
      const isPunjab = province.toLowerCase().includes("punjab");
      if (isPunjab) {
        shippingFee = 350;
        shippingType = "punjab";
      } else {
        shippingFee = 450;
        shippingType = "pakistan_other";
      }
      deliveryEstimate = "3–5 business days";
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
    const reservedItems: { productId: string; size: string; quantity: number }[] = [];

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

    // 7. Generate Order Number & Persist Order Document
    const dateStr = new Date().toISOString().slice(2, 7).replace("-", ""); // e.g. "2609"
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BFH-${dateStr}-${randomSuffix}`;

    const newOrder = await Order.create({
      orderNumber,
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
      },
      orderStatus: "confirmed",
    });

    return NextResponse.json({
      success: true,
      order: {
        orderId: String(newOrder._id),
        orderNumber: newOrder.orderNumber,
        customer: newOrder.customer,
        pricing: newOrder.pricing,
        shipping: newOrder.shipping,
        payment: newOrder.payment,
        items: newOrder.items,
        createdAt: newOrder.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "We encountered an issue processing your order. Please try again or contact us on WhatsApp.",
      },
      { status: 500 }
    );
  }
}
