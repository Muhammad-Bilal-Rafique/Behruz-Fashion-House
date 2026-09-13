"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import connectDB from "@/lib/connect";
import Settings from "@/models/Settings";
import {
  SerializedSettings,
  DEFAULT_STORE_SETTINGS,
} from "@/config/settings";
import { clearStoreSettingsCache } from "@/lib/store-settings-server";

/**
 * Fetch existing settings from MongoDB, creating default document if it doesn't exist yet.
 */
export async function getSettingsAction(): Promise<SerializedSettings> {
  try {
    await connectDB();
    let settingsDoc = await Settings.findOne().lean();

    if (!settingsDoc) {
      const created = await Settings.create(DEFAULT_STORE_SETTINGS);
      settingsDoc = created.toObject();
    }

    return {
      advancePaymentAmount:
        settingsDoc.advancePaymentAmount ??
        DEFAULT_STORE_SETTINGS.advancePaymentAmount,
      walletAccountName:
        settingsDoc.walletAccountName ??
        DEFAULT_STORE_SETTINGS.walletAccountName,
      walletAccountNumber:
        settingsDoc.walletAccountNumber ??
        DEFAULT_STORE_SETTINGS.walletAccountNumber,
      walletDisplayNumber:
        settingsDoc.walletDisplayNumber ??
        DEFAULT_STORE_SETTINGS.walletDisplayNumber,
      bankName:
        settingsDoc.bankName ?? DEFAULT_STORE_SETTINGS.bankName,
      bankAccountName:
        settingsDoc.bankAccountName ??
        DEFAULT_STORE_SETTINGS.bankAccountName,
      bankAccountNumber:
        settingsDoc.bankAccountNumber ??
        DEFAULT_STORE_SETTINGS.bankAccountNumber,
      bankIban:
        settingsDoc.bankIban ?? DEFAULT_STORE_SETTINGS.bankIban,
      paymentInstructions:
        settingsDoc.paymentInstructions ??
        DEFAULT_STORE_SETTINGS.paymentInstructions,
      punjabShippingFee:
        settingsDoc.punjabShippingFee ??
        DEFAULT_STORE_SETTINGS.punjabShippingFee,
      otherPakistanShippingFee:
        settingsDoc.otherPakistanShippingFee ??
        DEFAULT_STORE_SETTINGS.otherPakistanShippingFee,
      freeShippingThreshold:
        settingsDoc.freeShippingThreshold ??
        DEFAULT_STORE_SETTINGS.freeShippingThreshold,
      deliveryEstimate:
        settingsDoc.deliveryEstimate ??
        DEFAULT_STORE_SETTINGS.deliveryEstimate,
      whatsappNumber:
        settingsDoc.whatsappNumber ??
        DEFAULT_STORE_SETTINGS.whatsappNumber,
      whatsappDisplayNumber:
        settingsDoc.whatsappDisplayNumber ??
        DEFAULT_STORE_SETTINGS.whatsappDisplayNumber,
      supportEmail:
        settingsDoc.supportEmail ?? DEFAULT_STORE_SETTINGS.supportEmail,
      shopAddress:
        settingsDoc.shopAddress ?? DEFAULT_STORE_SETTINGS.shopAddress,
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return DEFAULT_STORE_SETTINGS;
  }
}

/**
 * Update store settings document in MongoDB.
 */
export async function updateSettingsAction(
  data: Partial<SerializedSettings>
): Promise<{ success: boolean; error?: string; settings?: SerializedSettings }> {
  try {
    await connectDB();

    // Basic sanitization & validations
    const advanceAmount = Math.max(0, Number(data.advancePaymentAmount ?? 1000));
    const punjabFee = Math.max(0, Number(data.punjabShippingFee ?? 350));
    const otherFee = Math.max(0, Number(data.otherPakistanShippingFee ?? 450));
    const freeThreshold = Math.max(0, Number(data.freeShippingThreshold ?? 0));

    const updatePayload = {
      advancePaymentAmount: advanceAmount,
      walletAccountName:
        String(data.walletAccountName || "").trim() ||
        DEFAULT_STORE_SETTINGS.walletAccountName,
      walletAccountNumber:
        String(data.walletAccountNumber || "").trim() ||
        DEFAULT_STORE_SETTINGS.walletAccountNumber,
      walletDisplayNumber:
        String(data.walletDisplayNumber || "").trim() ||
        DEFAULT_STORE_SETTINGS.walletDisplayNumber,
      bankName:
        String(data.bankName || "").trim() || DEFAULT_STORE_SETTINGS.bankName,
      bankAccountName:
        String(data.bankAccountName || "").trim() ||
        DEFAULT_STORE_SETTINGS.bankAccountName,
      bankAccountNumber:
        String(data.bankAccountNumber || "").trim() ||
        DEFAULT_STORE_SETTINGS.bankAccountNumber,
      bankIban:
        String(data.bankIban || "").trim() || DEFAULT_STORE_SETTINGS.bankIban,
      paymentInstructions:
        String(data.paymentInstructions || "").trim() ||
        DEFAULT_STORE_SETTINGS.paymentInstructions,
      punjabShippingFee: punjabFee,
      otherPakistanShippingFee: otherFee,
      freeShippingThreshold: freeThreshold,
      deliveryEstimate:
        String(data.deliveryEstimate || "").trim() ||
        DEFAULT_STORE_SETTINGS.deliveryEstimate,
      whatsappNumber:
        String(data.whatsappNumber || "").replace(/\D/g, "") ||
        DEFAULT_STORE_SETTINGS.whatsappNumber,
      whatsappDisplayNumber:
        String(data.whatsappDisplayNumber || "").trim() ||
        DEFAULT_STORE_SETTINGS.whatsappDisplayNumber,
      supportEmail:
        String(data.supportEmail || "").trim() ||
        DEFAULT_STORE_SETTINGS.supportEmail,
      shopAddress:
        String(data.shopAddress || "").trim() ||
        DEFAULT_STORE_SETTINGS.shopAddress,
    };

    const updated = await Settings.findOneAndUpdate({}, updatePayload, {
      upsert: true,
      new: true,
    }).lean();

    clearStoreSettingsCache();
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
    revalidatePath("/");

    return {
      success: true,
      settings: {
        advancePaymentAmount: updated.advancePaymentAmount,
        walletAccountName: updated.walletAccountName,
        walletAccountNumber: updated.walletAccountNumber,
        walletDisplayNumber: updated.walletDisplayNumber,
        bankName: updated.bankName,
        bankAccountName: updated.bankAccountName,
        bankAccountNumber: updated.bankAccountNumber,
        bankIban: updated.bankIban,
        paymentInstructions: updated.paymentInstructions,
        punjabShippingFee: updated.punjabShippingFee,
        otherPakistanShippingFee: updated.otherPakistanShippingFee,
        freeShippingThreshold: updated.freeShippingThreshold,
        deliveryEstimate: updated.deliveryEstimate,
        whatsappNumber: updated.whatsappNumber,
        whatsappDisplayNumber: updated.whatsappDisplayNumber,
        supportEmail: updated.supportEmail,
        shopAddress: updated.shopAddress,
      },
    };
  } catch (error: any) {
    console.error("updateSettingsAction error:", error);
    return {
      success: false,
      error: error.message || "Failed to update store settings.",
    };
  }
}

/**
 * Server action to update admin login password in MongoDB
 */
export async function changeAdminPasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { changeAdminPassword } = await import("@/lib/admin-service");
    const { getCurrentAdminSession } = await import("@/app/admin/login/actions");
    const session = await getCurrentAdminSession();
    const result = await changeAdminPassword(session.email, currentPassword, newPassword);
    return {
      success: result.success,
      message: result.message || (result.success ? "Password updated successfully." : "Failed to update password."),
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Failed to update password.",
    };
  }
}

