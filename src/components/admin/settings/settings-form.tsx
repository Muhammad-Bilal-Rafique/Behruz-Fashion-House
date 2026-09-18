"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Truck,
  Phone,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  Wallet,
  Mail,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSettingsAction } from "@/app/admin/settings/actions";
import {
  SerializedSettings,
  DEFAULT_STORE_SETTINGS,
} from "@/config/settings";

interface SettingsFormProps {
  initialSettings: SerializedSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<SerializedSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to restore default Behruz store settings? You will need to click 'Save Settings' to apply."
      )
    ) {
      setFormData(DEFAULT_STORE_SETTINGS);
      toast.info("Form populated with default settings. Click 'Save Changes' to apply.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await updateSettingsAction(formData);

      if (res.success && res.settings) {
        setFormData(res.settings);
        toast.success("Store settings updated successfully!", {
          description: "All storefront checkout, advance, and contact rules have been refreshed.",
        });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update store settings.");
      }
    } catch (err) {
      console.error("Save settings error:", err);
      toast.error("Network error while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ======================================================== */}
      {/* 1. PAYMENT & ADVANCE VERIFICATION RULES                  */}
      {/* ======================================================== */}
      <div className="border border-border rounded-xs bg-card p-6 space-y-6 shadow-2xs">
        <div className="flex items-start gap-3 border-b border-border/70 pb-4">
          <div className="w-10 h-10 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-normal text-foreground">
              Payment & Advance Verification
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set the required advance deposit and verified banking accounts for order confirmation.
            </p>
          </div>
        </div>

        {/* Advance Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="advancePaymentAmount" className="text-xs font-semibold text-foreground">
              Mandatory Advance Amount (PKR)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                PKR
              </span>
              <Input
                id="advancePaymentAmount"
                name="advancePaymentAmount"
                type="number"
                min="0"
                step="50"
                value={formData.advancePaymentAmount}
                onChange={handleChange}
                className="pl-12 text-xs font-medium rounded-xs"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Fixed advance deposit required from customers to confirm cash-on-delivery orders.
            </p>
          </div>
        </div>

        {/* Mobile Wallets Sub-card */}
        <div className="p-4 rounded-xs border border-border/80 bg-muted/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Wallet className="w-4 h-4 text-primary" />
            <span>Mobile Wallet Account (EasyPaisa / JazzCash)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="walletAccountName" className="text-[11px] font-medium text-foreground">
                Account Title
              </Label>
              <Input
                id="walletAccountName"
                name="walletAccountName"
                value={formData.walletAccountName}
                onChange={handleChange}
                placeholder="e.g. Fahad Arshad"
                className="text-xs rounded-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="walletAccountNumber" className="text-[11px] font-medium text-foreground">
                Account Number (Numeric)
              </Label>
              <Input
                id="walletAccountNumber"
                name="walletAccountNumber"
                value={formData.walletAccountNumber}
                onChange={handleChange}
                placeholder="03415590094"
                className="text-xs font-mono rounded-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="walletDisplayNumber" className="text-[11px] font-medium text-foreground">
                Display Format
              </Label>
              <Input
                id="walletDisplayNumber"
                name="walletDisplayNumber"
                value={formData.walletDisplayNumber}
                onChange={handleChange}
                placeholder="0341-5590094"
                className="text-xs font-mono rounded-xs"
                required
              />
            </div>
          </div>
        </div>

        {/* Bank Account Sub-card */}
        <div className="p-4 rounded-xs border border-border/80 bg-muted/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Bank Transfer Account (IBFT / Raast)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bankName" className="text-[11px] font-medium text-foreground">
                Bank Name
              </Label>
              <Input
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Bank Al Habib"
                className="text-xs rounded-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bankAccountName" className="text-[11px] font-medium text-foreground">
                Account Title
              </Label>
              <Input
                id="bankAccountName"
                name="bankAccountName"
                value={formData.bankAccountName}
                onChange={handleChange}
                placeholder="Fahad Arshad"
                className="text-xs rounded-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bankAccountNumber" className="text-[11px] font-medium text-foreground">
                Account Number
              </Label>
              <Input
                id="bankAccountNumber"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                placeholder="55501865002328506"
                className="text-xs font-mono rounded-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bankIban" className="text-[11px] font-medium text-foreground">
                IBAN / Raast
              </Label>
              <Input
                id="bankIban"
                name="bankIban"
                value={formData.bankIban}
                onChange={handleChange}
                placeholder="PK72BAHL55401865002328506"
                className="text-xs font-mono rounded-xs"
                required
              />
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="space-y-1.5">
          <Label htmlFor="paymentInstructions" className="text-xs font-semibold text-foreground">
            Customer Advance Payment Instructions
          </Label>
          <Textarea
            id="paymentInstructions"
            name="paymentInstructions"
            rows={2}
            value={formData.paymentInstructions}
            onChange={handleChange}
            placeholder="Instructions displayed on checkout & success page..."
            className="text-xs rounded-xs resize-none"
          />
          <p className="text-[11px] text-muted-foreground">
            Displayed prominently on the order success screen guiding customers to send proof via WhatsApp.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SHIPPING & DELIVERY FEES                              */}
      {/* ======================================================== */}
      <div className="border border-border rounded-xs bg-card p-6 space-y-6 shadow-2xs">
        <div className="flex items-start gap-3 border-b border-border/70 pb-4">
          <div className="w-10 h-10 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-normal text-foreground">
              Shipping & Delivery Charges
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Standard dispatch fees applied at checkout based on customer province.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Punjab Delivery Fee */}
          <div className="space-y-1.5">
            <Label htmlFor="punjabShippingFee" className="text-xs font-semibold text-foreground">
              Punjab Shipping Fee (PKR)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                PKR
              </span>
              <Input
                id="punjabShippingFee"
                name="punjabShippingFee"
                type="number"
                min="0"
                value={formData.punjabShippingFee}
                onChange={handleChange}
                className="pl-12 text-xs font-medium rounded-xs"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Applied automatically when customer address is in Punjab.
            </p>
          </div>

          {/* Other Pakistan Delivery Fee */}
          <div className="space-y-1.5">
            <Label htmlFor="otherPakistanShippingFee" className="text-xs font-semibold text-foreground">
              Rest of Pakistan Fee (PKR)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                PKR
              </span>
              <Input
                id="otherPakistanShippingFee"
                name="otherPakistanShippingFee"
                type="number"
                min="0"
                value={formData.otherPakistanShippingFee}
                onChange={handleChange}
                className="pl-12 text-xs font-medium rounded-xs"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Applied for Sindh, KPK, Balochistan, Islamabad & GB.
            </p>
          </div>

          {/* Free Shipping Threshold */}
          <div className="space-y-1.5">
            <Label htmlFor="freeShippingThreshold" className="text-xs font-semibold text-foreground">
              Free Shipping Threshold (PKR)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                PKR
              </span>
              <Input
                id="freeShippingThreshold"
                name="freeShippingThreshold"
                type="number"
                min="0"
                value={formData.freeShippingThreshold}
                onChange={handleChange}
                placeholder="0 to disable"
                className="pl-12 text-xs font-medium rounded-xs"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Orders above this subtotal qualify for free delivery (0 to disable).
            </p>
          </div>
        </div>

        {/* Delivery Estimate Text */}
        <div className="space-y-1.5">
          <Label htmlFor="deliveryEstimate" className="text-xs font-semibold text-foreground">
            Estimated Delivery Days
          </Label>
          <Input
            id="deliveryEstimate"
            name="deliveryEstimate"
            value={formData.deliveryEstimate}
            onChange={handleChange}
            placeholder="e.g. 3–5 business days across Pakistan"
            className="text-xs rounded-xs max-w-md"
            required
          />
          <p className="text-[11px] text-muted-foreground">
            Shown to customers during checkout and on shipping summary cards.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. STORE CONTACT & WHATSAPP SUPPORT                      */}
      {/* ======================================================== */}
      <div className="border border-border rounded-xs bg-card p-6 space-y-6 shadow-2xs">
        <div className="flex items-start gap-3 border-b border-border/70 pb-4">
          <div className="w-10 h-10 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-normal text-foreground">
              Store Contact & WhatsApp
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Contact numbers used for order verification WhatsApp links, customer care, and footer display.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* WhatsApp Raw Number */}
          <div className="space-y-1.5">
            <Label htmlFor="whatsappNumber" className="text-xs font-semibold text-foreground">
              WhatsApp API Number (wa.me)
            </Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              placeholder="923354623733"
              className="text-xs font-mono rounded-xs"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Format with country code (e.g. 92...) without plus signs or dashes for instant WhatsApp chat links.
            </p>
          </div>

          {/* WhatsApp Display Number */}
          <div className="space-y-1.5">
            <Label htmlFor="whatsappDisplayNumber" className="text-xs font-semibold text-foreground">
              Display Phone Number
            </Label>
            <Input
              id="whatsappDisplayNumber"
              name="whatsappDisplayNumber"
              value={formData.whatsappDisplayNumber}
              onChange={handleChange}
              placeholder="0335-4623733"
              className="text-xs font-mono rounded-xs"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Formatted phone number displayed visibly across the storefront.
            </p>
          </div>

          {/* Support Email */}
          <div className="space-y-1.5">
            <Label htmlFor="supportEmail" className="text-xs font-semibold text-foreground">
              Customer Support Email
            </Label>
            <Input
              id="supportEmail"
              name="supportEmail"
              type="email"
              value={formData.supportEmail}
              onChange={handleChange}
              placeholder="behruzfashionhouse@gmail.com"
              className="text-xs rounded-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Email shown on customer invoices, contact page, and footer.
            </p>
          </div>
        </div>

        {/* Physical Studio Address */}
        <div className="space-y-1.5">
          <Label htmlFor="shopAddress" className="text-xs font-semibold text-foreground">
            Boutique & Studio Address
          </Label>
          <Input
            id="shopAddress"
            name="shopAddress"
            value={formData.shopAddress}
            onChange={handleChange}
            placeholder="City Tower, Shop 3, 1st Floor, Gulshan-e-Ravi, Lahore"
            className="text-xs rounded-xs"
            required
          />
          <p className="text-[11px] text-muted-foreground">
            Physical studio location printed on order packing slips and contact sections.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. ACTIONS BAR                                           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleResetToDefaults}
          disabled={isSaving}
          className="w-full sm:w-auto text-xs h-10 px-4 rounded-xs border-border text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </Button>

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto text-xs h-10 px-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xs shadow-xs gap-2 cursor-pointer"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? "Saving Settings..." : "Save Settings"}</span>
        </Button>
      </div>
    </form>
  );
}
