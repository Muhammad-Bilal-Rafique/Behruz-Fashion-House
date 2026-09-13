"use client";

import React, { createContext, useContext } from "react";
import {
  SerializedSettings,
  DEFAULT_STORE_SETTINGS,
} from "@/config/settings";

const StoreSettingsContext = createContext<SerializedSettings>(
  DEFAULT_STORE_SETTINGS
);

export interface StoreSettingsProviderProps {
  initialSettings: SerializedSettings;
  children: React.ReactNode;
}

export function StoreSettingsProvider({
  initialSettings,
  children,
}: StoreSettingsProviderProps) {
  return (
    <StoreSettingsContext.Provider value={initialSettings}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

/**
 * Custom hook to consume store settings anywhere in client components without network waterfalls.
 */
export function useStoreSettings(): SerializedSettings {
  const context = useContext(StoreSettingsContext);
  return context || DEFAULT_STORE_SETTINGS;
}

/**
 * Dynamic helper to build WhatsApp payment confirmation URLs using active store settings.
 */
export function generateWhatsAppProofUrl(
  orderNumber: string,
  customerName: string,
  settings: SerializedSettings
): string {
  const message =
    `Hello, I have placed an order on Behruz Fashion House.\n\n` +
    `Order Number: #${orderNumber}\n` +
    `Customer Name: ${customerName}\n` +
    `Advance Payment: PKR ${settings.advancePaymentAmount.toLocaleString()}\n\n` +
    `I have made the advance payment and am sending the payment screenshot for verification.`;

  const cleanNumber = (settings.whatsappNumber || "923354623733").replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
