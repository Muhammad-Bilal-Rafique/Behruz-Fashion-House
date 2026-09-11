"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { useCartHydrated } from "@/lib/cart-store";
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, hasHydrated, subtotal, clearCart } = useCartHydrated();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim()) {
      toast.error("Please fill in all required delivery fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate order placement
    setTimeout(() => {
      const orderId = `BHF-${Date.now().toString().slice(-6)}`;
      setOrderConfirmed(orderId);
      setIsSubmitting(false);
      clearCart();
      toast.success("Order Placed Successfully!");
    }, 800);
  };

  // WhatsApp confirmation link
  const whatsappNumber = "923354623733";
  const whatsappMessage = encodeURIComponent(
    `Hello Behruz Fashion House! I would like to confirm my order ${orderConfirmed || ""}.\n\nName: ${formData.fullName}\nPhone: ${formData.phone}\nCity: ${formData.city}\nAddress: ${formData.address}\nTotal: PKR ${subtotal.toLocaleString()}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {orderConfirmed ? (
          /* ======================================================== */
          /* ORDER CONFIRMATION SCREEN                                */
          /* ======================================================== */
          <div className="max-w-xl mx-auto text-center py-12 px-6 border border-border bg-muted/10 rounded-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium block mb-2">
              BEHRUZ FASHION HOUSE
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-foreground mb-2">
              Thank You for Your Order!
            </h1>

            <p className="text-sm text-muted-foreground font-light mb-4">
              Your order number is <strong className="text-foreground font-semibold">{orderConfirmed}</strong>. We will process and dispatch your couture pieces promptly.
            </p>

            <div className="p-4 rounded-xs bg-muted/40 border border-border text-left mb-6 space-y-1.5 text-xs text-muted-foreground">
              <p><strong className="text-foreground">Recipient:</strong> {formData.fullName}</p>
              <p><strong className="text-foreground">Phone:</strong> {formData.phone}</p>
              <p><strong className="text-foreground">Shipping Address:</strong> {formData.address}, {formData.city}</p>
              <p><strong className="text-foreground">Payment Method:</strong> Cash on Delivery (COD)</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-[#25D366] text-white hover:bg-[#25D366]/90 transition-colors shadow-xs"
              >
                <Phone className="mr-2 w-4 h-4" />
                <span>Confirm on WhatsApp</span>
              </a>

              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-foreground border border-border hover:border-foreground transition-colors"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* ======================================================== */
          /* EMPTY CART CHECKOUT GUARD                                */
          /* ======================================================== */
          <div className="max-w-md mx-auto text-center py-16">
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
              Your bag is currently empty
            </h1>
            <p className="text-sm text-muted-foreground mb-6 font-light">
              Add some of our luxury pret or couture pieces before proceeding to checkout.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-[#FF3154] text-white hover:bg-[#FF3154]/90 transition-colors shadow-xs"
            >
              <span>Explore Collection</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* ======================================================== */
          /* CHECKOUT FORM & SUMMARY                                  */
          /* ======================================================== */
          <div>
            <div className="mb-8">
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Bag</span>
              </Link>
              <h1 className="font-serif text-2xl sm:text-4xl text-foreground font-normal tracking-tight">
                Checkout & Shipping
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              {/* Delivery Details Form */}
              <div className="lg:col-span-7">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border border-border p-6 rounded-xs bg-muted/10 space-y-4">
                    <h2 className="font-serif text-lg font-normal text-foreground">
                      Contact & Delivery Address
                    </h2>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-foreground mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Ayesha Malik"
                        className="w-full px-3.5 py-2.5 text-xs bg-background border border-border focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider font-medium text-foreground mb-1.5">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g. 0300 1234567"
                          className="w-full px-3.5 py-2.5 text-xs bg-background border border-border focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider font-medium text-foreground mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. ayesha@example.com"
                          className="w-full px-3.5 py-2.5 text-xs bg-background border border-border focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-foreground mb-1.5">
                        Shipping Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="House / Apartment, Street, Area"
                        className="w-full px-3.5 py-2.5 text-xs bg-background border border-border focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-foreground mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Lahore, Karachi, Islamabad"
                        className="w-full px-3.5 py-2.5 text-xs bg-background border border-border focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-medium text-foreground mb-1.5">
                        Special Instructions / Notes
                      </label>
                      <textarea
                        name="notes"
                        rows={2}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any special requests or delivery timings..."
                        className="w-full px-3.5 py-2.5 text-xs bg-background border border-border focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="border border-border p-6 rounded-xs bg-muted/10 space-y-3">
                    <h2 className="font-serif text-lg font-normal text-foreground">
                      Payment Method
                    </h2>
                    <div className="flex items-center gap-3 p-3.5 border border-primary/40 bg-primary/5 rounded-xs">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[11px] text-muted-foreground font-light">
                          Pay in cash upon doorstep delivery across Pakistan.
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#FF3154] hover:bg-[#FF3154]/90 disabled:opacity-60 text-white text-xs font-semibold tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isSubmitting ? "Processing Order..." : `Place Order • PKR ${subtotal.toLocaleString()}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-5">
                <div className="border border-border p-6 rounded-xs bg-muted/20 sticky top-24 space-y-6">
                  <h2 className="font-serif text-lg font-normal text-foreground pb-3 border-b border-border">
                    Order Summary ({items.length} items)
                  </h2>

                  <div className="divide-y divide-border/60 max-h-80 overflow-y-auto pr-2 space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                        <div className="relative w-14 h-18 bg-muted rounded-xs overflow-hidden shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-medium text-foreground truncate">
                            {item.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            Size: {item.size} • Qty: {item.quantity}
                          </p>
                          <p className="text-xs font-semibold text-foreground mt-0.5">
                            PKR {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="text-foreground font-medium">
                        PKR {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="text-emerald-600 font-medium uppercase tracking-wider text-[11px]">
                        Free
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border text-sm font-semibold text-foreground">
                      <span>Total</span>
                      <span>PKR {subtotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Delivery in 3–5 working days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>100% Authentic Pakistani Haute Couture</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
