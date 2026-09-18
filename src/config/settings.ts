export interface SerializedSettings {
  advancePaymentAmount: number;
  walletAccountName: string;
  walletAccountNumber: string;
  walletDisplayNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIban: string;
  paymentInstructions: string;
  punjabShippingFee: number;
  otherPakistanShippingFee: number;
  freeShippingThreshold: number;
  deliveryEstimate: string;
  whatsappNumber: string;
  whatsappDisplayNumber: string;
  supportEmail: string;
  shopAddress: string;
}

export const DEFAULT_STORE_SETTINGS: SerializedSettings = {
  advancePaymentAmount: 1000,
  walletAccountName: "Fahad Arshad",
  walletAccountNumber: "03415590094",
  walletDisplayNumber: "0341-5590094",
  bankName: "Bank Al Habib",
  bankAccountName: "Fahad Arshad",
  bankAccountNumber: "55501865002328506",
  bankIban: "PK72BAHL55401865002328506",
  paymentInstructions:
    "Transfer PKR 1,000 via online banking or mobile wallet, then share the receipt screenshot on WhatsApp to confirm your order.",
  punjabShippingFee: 350,
  otherPakistanShippingFee: 450,
  freeShippingThreshold: 0,
  deliveryEstimate: "3–5 business days across Pakistan",
  whatsappNumber: "923354623733",
  whatsappDisplayNumber: "0335-4623733",
  supportEmail: "behruzfashionhouse@gmail.com",
  shopAddress: "City Tower, Shop 3, 1st Floor, Gulshan-e-Ravi, Lahore",
};
