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
  Sparkles,
} from "lucide-react";

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
  isSubmitting: boolean;
  hasStockIssues: boolean;
  onSubmit: (data: CheckoutFormData) => void;
  onShippingChange?: (shippingFee: number, isInternational: boolean, province: string) => void;
}

export function CheckoutForm({
  isSubmitting,
  hasStockIssues,
  onSubmit,
  onShippingChange,
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

  const watchedCountry = watch("country");
  const watchedProvince = watch("province");

  const isPakistan = (watchedCountry || "").toLowerCase() === "pakistan";
  const isPunjab = isPakistan && (watchedProvince || "").toLowerCase().includes("punjab");

  // Calculate dynamic shipping fee
  const shippingFee = isPakistan ? (isPunjab ? 350 : 450) : 0;
  const isInternational = !isPakistan;

  // Inform parent of shipping changes
  useEffect(() => {
    onShippingChange?.(shippingFee, isInternational, watchedProvince);
  }, [shippingFee, isInternational, watchedProvince, onShippingChange]);

  // When country switches to Pakistan, ensure a default Pakistani province is set
  useEffect(() => {
    if (isPakistan && (!watchedProvince || !PAKISTAN_PROVINCES.includes(watchedProvince as any))) {
      setValue("province", "Punjab");
    } else if (!isPakistan && PAKISTAN_PROVINCES.includes(watchedProvince as any)) {
      setValue("province", "");
    }
  }, [isPakistan, setValue, watchedProvince]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 1. CUSTOMER & DELIVERY INFORMATION */}
      <div className="border border-border p-6 sm:p-8 rounded-xs bg-card shadow-2xs space-y-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold block mb-1">
            Step 1
          </span>
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

          {/* Phone & Email (2 Cols) */}
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

          {/* Country & Province (2 Cols) */}
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
                      {prov} {prov === "Punjab" ? "(PKR 350 Delivery)" : "(PKR 450 Delivery)"}
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

      {/* 2. SHIPPING & DELIVERY TIMELINE INFORMATION */}
      <div className="border border-border p-6 sm:p-8 rounded-xs bg-card shadow-2xs space-y-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold block mb-1">
            Step 2
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-foreground flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <span>Shipping & Delivery Schedule</span>
          </h2>
        </div>

        <div className="p-4 rounded-xs border border-border bg-secondary/30 space-y-2">
          {isPakistan ? (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Delivery Region:{" "}
                  <span className="text-primary">{watchedProvince || "Punjab"}</span>
                </span>
                <span className="font-mono font-bold text-foreground">
                  PKR {shippingFee.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">
                  Estimated Delivery: 3–5 business days
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
                {isPunjab
                  ? "Standard domestic shipping within Punjab is PKR 350."
                  : "Standard domestic shipping to this province/region is PKR 450."}
              </p>
            </>
          ) : (
            <>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    International Shipping ({watchedCountry})
                  </span>
                  <span className="text-xs font-semibold text-primary">
                    To be calculated
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-medium text-foreground">
                    Estimated Delivery: 10 business days
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-2 border-t border-border/50">
                International shipping charges will be calculated based on package weight.
                Our concierge team will reach out via WhatsApp/Email to confirm the final weight-based shipping fee.
              </p>
            </>
          )}
        </div>
      </div>

      {/* 3. PAYMENT METHOD */}
      <div className="border border-border p-6 sm:p-8 rounded-xs bg-card shadow-2xs space-y-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold block mb-1">
            Step 3
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-foreground flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" />
            <span>Payment Method</span>
          </h2>
        </div>

        {isPakistan ? (
          <div className="p-4 rounded-xs border-2 border-primary bg-primary/[0.03] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground tracking-wide uppercase flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-4 border-primary bg-background inline-block" />
                Cash on Delivery (COD)
              </span>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Available
              </span>
            </div>
            <p className="text-xs text-muted-foreground pl-5">
              Pay when your order is delivered directly to your doorstep.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xs border border-border bg-muted/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground tracking-wide uppercase flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                International Order Processing
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Shipping and payment instructions will be communicated and confirmed by our boutique concierge once your order is placed.
            </p>
          </div>
        )}
      </div>

      {/* 4. EXCHANGE POLICY & TRUST GUARANTEE */}
      <div className="border border-border p-5 rounded-xs bg-muted/20 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground font-semibold uppercase tracking-wider text-[11px]">
          <RotateCcw className="w-3.5 h-3.5 text-primary" />
          <span>Exchange Policy & Guarantee</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Exchange available within <strong>2 days</strong> for valid reasons. Items must be unused and unwashed with original tags attached. <em>All sales are final. There are no refunds.</em>
        </p>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-2">
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

        {hasStockIssues && (
          <p className="mt-2 text-center text-xs text-red-500 font-medium">
            Please resolve the out-of-stock items shown in your order summary before proceeding.
          </p>
        )}
      </div>
    </form>
  );
}

export default CheckoutForm;
