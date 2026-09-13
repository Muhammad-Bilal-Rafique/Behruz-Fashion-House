import connectDB from "@/lib/connect";
import Settings from "@/models/Settings";
import {
  SerializedSettings,
  DEFAULT_STORE_SETTINGS,
} from "@/config/settings";

/**
 * Internal worker that connects to MongoDB and retrieves serialized settings.
 */
async function fetchStoreSettingsFromDB(): Promise<SerializedSettings> {
  try {
    await connectDB();
    const settingsDoc = await Settings.findOne().lean();

    if (!settingsDoc) {
      return DEFAULT_STORE_SETTINGS;
    }

    return {
      advancePaymentAmount:
        typeof settingsDoc.advancePaymentAmount === "number"
          ? settingsDoc.advancePaymentAmount
          : DEFAULT_STORE_SETTINGS.advancePaymentAmount,
      walletAccountName:
        settingsDoc.walletAccountName ||
        DEFAULT_STORE_SETTINGS.walletAccountName,
      walletAccountNumber:
        settingsDoc.walletAccountNumber ||
        DEFAULT_STORE_SETTINGS.walletAccountNumber,
      walletDisplayNumber:
        settingsDoc.walletDisplayNumber ||
        DEFAULT_STORE_SETTINGS.walletDisplayNumber,
      bankName: settingsDoc.bankName || DEFAULT_STORE_SETTINGS.bankName,
      bankAccountName:
        settingsDoc.bankAccountName ||
        DEFAULT_STORE_SETTINGS.bankAccountName,
      bankAccountNumber:
        settingsDoc.bankAccountNumber ||
        DEFAULT_STORE_SETTINGS.bankAccountNumber,
      bankIban: settingsDoc.bankIban || DEFAULT_STORE_SETTINGS.bankIban,
      paymentInstructions:
        settingsDoc.paymentInstructions ||
        DEFAULT_STORE_SETTINGS.paymentInstructions,
      punjabShippingFee:
        typeof settingsDoc.punjabShippingFee === "number"
          ? settingsDoc.punjabShippingFee
          : DEFAULT_STORE_SETTINGS.punjabShippingFee,
      otherPakistanShippingFee:
        typeof settingsDoc.otherPakistanShippingFee === "number"
          ? settingsDoc.otherPakistanShippingFee
          : DEFAULT_STORE_SETTINGS.otherPakistanShippingFee,
      freeShippingThreshold:
        typeof settingsDoc.freeShippingThreshold === "number"
          ? settingsDoc.freeShippingThreshold
          : DEFAULT_STORE_SETTINGS.freeShippingThreshold,
      deliveryEstimate:
        settingsDoc.deliveryEstimate ||
        DEFAULT_STORE_SETTINGS.deliveryEstimate,
      whatsappNumber:
        settingsDoc.whatsappNumber ||
        DEFAULT_STORE_SETTINGS.whatsappNumber,
      whatsappDisplayNumber:
        settingsDoc.whatsappDisplayNumber ||
        DEFAULT_STORE_SETTINGS.whatsappDisplayNumber,
      supportEmail:
        settingsDoc.supportEmail || DEFAULT_STORE_SETTINGS.supportEmail,
      shopAddress:
        settingsDoc.shopAddress || DEFAULT_STORE_SETTINGS.shopAddress,
    };
  } catch (error) {
    console.error("Failed to fetch store settings from MongoDB:", error);
    return DEFAULT_STORE_SETTINGS;
  }
}

let memoryCache: { settings: SerializedSettings; timestamp: number } | null = null;
const CACHE_TTL_MS = 3000; // 3 seconds in-memory cache for ultra-fast SSR without stale disk cache

/**
 * Store settings getter with ultra-fast in-memory caching and instant cache clearing.
 * Always returns live MongoDB values, avoiding stale Next.js disk cache locks.
 */
export async function getStoreSettings(): Promise<SerializedSettings> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.settings;
  }
  const settings = await fetchStoreSettingsFromDB();
  memoryCache = { settings, timestamp: now };
  return settings;
}

export function clearStoreSettingsCache(): void {
  memoryCache = null;
}
