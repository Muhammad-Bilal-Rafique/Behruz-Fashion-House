"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Package, CheckCircle2, Clock, Truck, AlertCircle, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { WhatsAppIcon } from "@/components/shared/social-icons";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError("Please provide both your Order Reference and Phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Order not found. Please verify your details.");
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch (err) {
      console.error("Tracking error:", err);
      setError("Unable to connect to tracking server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: "awaiting_advance", label: "Awaiting Advance" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Tailoring / Processing" },
    { key: "dispatched", label: "Dispatched" },
    { key: "delivered", label: "Delivered" },
  ];

  const getStepIndex = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "cancelled") return -1;
    if (s === "awaiting_advance" || s === "pending") return 0;
    if (s === "confirmed") return 1;
    if (s === "processing") return 2;
    if (s === "dispatched" || s === "shipped") return 3;
    if (s === "delivered") return 4;
    return 0;
  };

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold block mb-2">
            Track Order
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-foreground tracking-tight">
            Order Status &amp; Timeline
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 font-light leading-relaxed">
            Enter your Order Reference Number and Phone Number to check real-time order status, verification, and dispatch details.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="max-w-xl mx-auto border border-border bg-card p-6 sm:p-8 rounded-xs shadow-xs mb-10">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="orderNumInput" className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-1.5">
                Order Reference Number
              </label>
              <input
                id="orderNumInput"
                type="text"
                placeholder="e.g. BFH-2609-A4B1"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full h-11 px-3.5 text-sm font-mono border border-border bg-background rounded-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="phoneInput" className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-1.5">
                Phone Number (used at checkout)
              </label>
              <input
                id="phoneInput"
                type="text"
                placeholder="e.g. 03291234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-3.5 text-sm border border-border bg-background rounded-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xs flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Order Status</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details Display */}
        {order && (
          <div className="border border-border bg-card p-6 sm:p-10 rounded-xs shadow-xs space-y-8 animate-in fade-in-50 duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
                  Order Reference
                </span>
                <h2 className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                  #{order.orderNumber}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Recipient: <strong>{order.customerName}</strong> ({order.city}, {order.province})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
                  Current Status
                </span>
                <span className="inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold bg-primary text-white mt-1">
                  {order.orderStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Timeline Bar */}
            {order.orderStatus === "cancelled" ? (
              <div className="p-4 bg-muted/40 border border-border text-center rounded-xs">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  This order has been cancelled.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-foreground font-semibold">
                  Order Progress Timeline
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div
                        key={step.key}
                        className={`p-3 border rounded-xs text-center flex flex-col items-center justify-center transition-all ${
                          isCurrent
                            ? "border-primary bg-primary/5 text-primary"
                            : isCompleted
                            ? "border-border bg-muted/20 text-foreground"
                            : "border-border/40 text-muted-foreground opacity-50"
                        }`}
                      >
                        <div className="mb-1.5">
                          {isCompleted ? (
                            <CheckCircle2 className={`w-4 h-4 ${isCurrent ? "text-primary" : "text-foreground"}`} />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Summary Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/20 border border-border rounded-xs text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Estimated Delivery
                </span>
                <span className="font-semibold text-foreground">
                  {order.deliveryEstimate}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Advance Payment
                </span>
                <span className="font-semibold text-primary">
                  PKR {order.advanceAmount?.toLocaleString()} ({order.advancePaymentStatus})
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Remaining on Delivery (COD)
                </span>
                <span className="font-semibold text-foreground">
                  PKR {order.remainingAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Items Ordered */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-foreground font-semibold">
                Items in this Order ({order.items.length})
              </h3>
              <div className="divide-y divide-border border border-border rounded-xs">
                {order.items.map((it: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center gap-3">
                    {it.image && (
                      <div className="relative w-12 h-14 bg-muted shrink-0 overflow-hidden">
                        <Image
                          src={it.image}
                          alt={it.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{it.name}</p>
                      <p className="text-[11px] text-muted-foreground">Size: {it.size} &bull; Qty: {it.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Contact Helper */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Have questions regarding delivery or advance verification?
              </span>
              <a
                href={`https://wa.me/923297121703?text=Hi%20Behruz%20Fashion%20House,%20I%20have%20an%20inquiry%20regarding%20Order%20${order.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-xs font-medium uppercase tracking-wider rounded-xs hover:bg-[#25D366]/90 transition-colors"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                <span>Contact Support</span>
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
