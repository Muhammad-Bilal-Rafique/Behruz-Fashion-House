"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { CheckoutSummary, type StockValidationItem } from "./checkout-summary";
import { type CartItem } from "@/lib/cart-store";
import { useStoreSettings } from "@/components/providers/store-settings-provider";

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email?: string;
  country: string;
  province: string;
  city: string;
  address: string;
}

export const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
] as const;

export const COUNTRIES = [
  "Pakistan",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Saudi Arabia",
  "Canada",
  "Australia",
  "Qatar",
  "Bahrain",
  "Oman",
  "Kuwait",
  "Other International",
];

interface CheckoutFormProps {
  items: CartItem[];
  subtotal: number;
  isSubmitting: boolean;
  hasStockIssues: boolean;
  stockValidationMap?: Map<string, StockValidationItem>;
  isValidatingStock?: boolean;
  onSubmit: (data: CheckoutFormData) => void;
}

export function CheckoutForm({
  items,
  subtotal,
  isSubmitting,
  hasStockIssues,
  stockValidationMap,
  isValidatingStock = false,
  onSubmit,
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      country: "Pakistan",
      province: "Punjab",
      city: "",
      address: "",
    },
    mode: "onTouched",
  });

  const settings = useStoreSettings();
  const watchedCountry = watch("country");
  const watchedProvince = watch("province");

  const isPakistan = (watchedCountry || "").toLowerCase() === "pakistan";
  const isPunjab = isPakistan && (watchedProvince || "").toLowerCase().includes("punjab");

  // Dynamic delivery fee calculation: checks free shipping threshold, Punjab fee, and rest of Pakistan fee
  const isFreeShipping = settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold;
  const shippingFee = isPakistan
    ? (isFreeShipping ? 0 : (isPunjab ? settings.punjabShippingFee : settings.otherPakistanShippingFee))
    : 0;
  const isInternational = !isPakistan;

  // When country switches to Pakistan, ensure a default Pakistani province is selected
  useEffect(() => {
    if (isPakistan && (!watchedProvince || !PAKISTAN_PROVINCES.includes(watchedProvince as any))) {
      setValue("province", "Punjab");
    } else if (!isPakistan && PAKISTAN_PROVINCES.includes(watchedProvince as any)) {
      setValue("province", "");
    }
  }, [isPakistan, setValue, watchedProvince]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: 1) Customer Details  2) COD Box            */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1) CUSTOMER & DELIVERY DETAILS */}
          <div className="border border-border p-6 sm:p-7 rounded-xs bg-card shadow-2xs space-y-5">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-foreground">
                Customer & Delivery Details
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Please provide the recipient details for prompt dispatch and courier updates.
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-1.5">
                  Full Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ayesha Malik"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                  })}
                  className={`w-full px-3.5 py-2.5 text-xs bg-background border rounded-xs focus:outline-hidden transition-colors ${
                    errors.fullName
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-primary"
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Phone & Email (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-1.5">
                    Phone Number / WhatsApp <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder={isPakistan ? "03XXXXXXXXX" : "+1 234 567 8900"}
                    {...register("phone", {
                      required: "Phone number is required for courier dispatch",
                      minLength: { value: 7, message: "Please provide a valid phone number" },
                    })}
                    className={`w-full px-3.5 py-2.5 text-xs bg-background border rounded-xs focus:outline-hidden transition-colors ${
                      errors.phone
                        ? "border-red-500 focus:border-red-500"
                        : "border-border focus:border-primary"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-1.5">
                    Email Address <span className="text-muted-foreground font-normal text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="ayesha@example.com"
                    {...register("email", {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email",
                      },
                    })}
                    className="w-full px-3.5 py-2.5 text-xs bg-background border border-border rounded-xs focus:border-primary focus:outline-hidden transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Country & Province (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-1.5">
                    Country <span className="text-primary">*</span>
                  </label>
                  <select
                    {...register("country", { required: "Please select a country" })}
                    className="w-full px-3.5 py-2.5 text-xs bg-background border border-border rounded-xs focus:border-primary focus:outline-hidden transition-colors cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-1.5">
                    Province / State <span className="text-primary">*</span>
                  </label>
                  {isPakistan ? (
                    <select
                      {...register("province", { required: "Please select your province" })}
                      className={`w-full px-3.5 py-2.5 text-xs bg-background border rounded-xs focus:outline-hidden transition-colors cursor-pointer ${
                        errors.province
                          ? "border-red-500 focus:border-red-500"
                          : "border-border focus:border-primary"
                      }`}
                    >
                      {PAKISTAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Dubai, California, London"
                      {...register("province", { required: "State / Province is required" })}
                      className={`w-full px-3.5 py-2.5 text-xs bg-background border rounded-xs focus:outline-hidden transition-colors ${
                        errors.province
                          ? "border-red-500 focus:border-red-500"
                          : "border-border focus:border-primary"
                      }`}
                    />
                  )}
                  {errors.province && (
                    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.province.message}
                    </p>
                  )}
                </div>
              </div>

              {/* City & Address */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-1.5">
                  City <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  {...register("city", {
                    required: "City is required",
                    minLength: { value: 2, message: "Please enter a valid city name" },
                  })}
                  className={`w-full px-3.5 py-2.5 text-xs bg-background border rounded-xs focus:outline-hidden transition-colors ${
                    errors.city
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-primary"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-foreground mb-1.5">
                  Complete Delivery Address <span className="text-primary">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="House/Apartment #, Street, Block/Sector, Area Landmark"
                  {...register("address", {
                    required: "Delivery address is required",
                    minLength: { value: 5, message: "Please provide complete street address" },
                  })}
                  className={`w-full px-3.5 py-2.5 text-xs bg-background border rounded-xs focus:outline-hidden transition-colors resize-none ${
                    errors.address
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-primary"
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2) PAYMENT POLICY & ADVANCE REQUIREMENT */}
          {isPakistan ? (
            <div className="border border-border p-4 rounded-xs bg-card shadow-2xs flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 mt-0.5">
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Payment Policy
                    </span>
                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-xs">
                      Advance Payment: PKR {settings.advancePaymentAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-foreground">
                    Required to confirm your order.
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    PKR {settings.advancePaymentAmount.toLocaleString()} advance payment is required to confirm your order. Remaining payment details will be handled according to the order/payment instructions provided after placing the order.
                  </p>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
          ) : (
            <div className="border border-border p-4 rounded-xs bg-card shadow-2xs flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                      International Order Processing
                    </span>
                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-xs">
                      Advance Payment: PKR {settings.advancePaymentAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-foreground">
                    Required to confirm your order.
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    PKR {settings.advancePaymentAmount.toLocaleString()} advance payment is required to confirm your order. Shipping & payment instructions will be confirmed via WhatsApp/Email after placing your order.
                  </p>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: 3) Order Details  4) Advance Notice        */}
        {/*               5) 3-5 Days Delivery  6) Place Order       */}
        {/*               7) Exchange Policy                         */}
        {/* ======================================================== */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* 3) ORDER DETAILS */}
            <CheckoutSummary
              items={items}
              subtotal={subtotal}
              shippingFee={shippingFee}
              isInternational={isInternational}
              stockValidationMap={stockValidationMap}
              isValidatingStock={isValidatingStock}
            />

            {/* 4) ELEGANT ADVANCE PAYMENT NOTICE CARD */}
            <div className="p-4 rounded-xs bg-[#FF3154]/[0.03] border border-[#FF3154]/25 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#FF3154]/10 text-[#FF3154] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <h3 className="font-serif text-sm font-normal text-foreground">
                  PKR {settings.advancePaymentAmount.toLocaleString()} Advance Required
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                A PKR {settings.advancePaymentAmount.toLocaleString()} advance payment is required to confirm your order. After placing your order, payment instructions will be provided. Your order will be confirmed once the advance payment is verified.
              </p>
            </div>

            {/* 5) DELIVERY ESTIMATE */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 px-3.5 py-2.5 rounded-xs border border-border">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>
                Estimated Delivery:{" "}
                <strong className="text-foreground font-semibold">
                  {isPakistan ? (settings.deliveryEstimate || "3–5 business days across Pakistan") : "approx. 10 business days"}
                </strong>
              </span>
            </div>

            {/* 6) PLACE ORDER BUTTON */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || hasStockIssues}
                className={`w-full py-4 px-6 text-xs uppercase tracking-[0.25em] font-semibold rounded-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  hasStockIssues
                    ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                    : "bg-[#FF3154] hover:bg-[#FF3154]/90 text-white active:scale-[0.99]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : hasStockIssues ? (
                  <span>Resolve Bag Issues to Place Order</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-[11px] text-muted-foreground font-light leading-normal">
                By placing this order, you acknowledge that a PKR {settings.advancePaymentAmount.toLocaleString()} advance payment is required to confirm your order.
              </p>

              {hasStockIssues && (
                <p className="mt-2 text-center text-xs text-red-500 font-medium">
                  Please resolve the out-of-stock items shown in your order summary before proceeding.
                </p>
              )}
            </div>

            {/* 7) ONE LINE EXCHANGE POLICY */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center pt-1">
              <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Exchange available within 2 days for valid reasons. All sales final, no refunds.</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default CheckoutForm;
