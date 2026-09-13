/**
 * Behruz Fashion House - Payment & WhatsApp Configuration
 * Centralized settings for advance payments, account details, and WhatsApp communication.
 */

export const PAYMENT_CONFIG = {
  // Client's verified WhatsApp contact number (format without + or dashes for wa.me links)
  whatsappNumber: "923354623733",
  whatsappDisplayNumber: "0335-4623733",

  // Approved advance payment amount in PKR
  advancePaymentAmount: 1000,

  // Store Physical Location
  shopAddress: "City Tower, Shop 3, 1st Floor, Gulshan-e-Ravi, Lahore",

  // Verified Payment Methods
  methods: [
    {
      id: "wallets",
      type: "mobile_wallet",
      title: "EasyPaisa / JazzCash",
      accountName: "Fahad Arshad",
      accountNumber: "03415590094",
      displayAccountNumber: "0341-5590094",
      instructions: "Send PKR 1,000 via EasyPaisa or JazzCash app/retailer to this mobile account.",
      badges: ["EasyPaisa", "JazzCash"],
    },
    {
      id: "bank_al_habib",
      type: "bank_transfer",
      title: "Bank Transfer",
      bankName: "Bank Al Habib",
      accountName: "Fahad Arshad",
      accountNumber: "55501865002328506",
      displayAccountNumber: "5550 1865 0023 2850 6",
      iban: "PK72BAHL55401865002328506",
      displayIban: "PK72 BAHL 5540 1865 0023 2850 6",
      instructions: "Transfer PKR 1,000 via online banking/ATM to Bank Al Habib, then share the receipt.",
      badges: ["Online Banking", "ATM Transfer", "Raast / IBFT"],
    },
  ],
} as const;

/**
 * Generates the pre-filled WhatsApp confirmation URL for sending payment proof
 */
export function generateWhatsAppProofUrl(orderNumber: string, customerName: string): string {
  const message =
    `Hello, I have placed an order on Behruz Fashion House.\n\n` +
    `Order Number: #${orderNumber}\n` +
    `Customer Name: ${customerName}\n` +
    `Advance Payment: PKR ${PAYMENT_CONFIG.advancePaymentAmount.toLocaleString()}\n\n` +
    `I have made the advance payment and am sending the payment screenshot for verification.`;

  return `https://wa.me/${PAYMENT_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
