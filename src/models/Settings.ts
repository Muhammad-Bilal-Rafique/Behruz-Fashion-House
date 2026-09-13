import mongoose, { Schema, Document, Model } from "mongoose";
import {
  SerializedSettings,
  DEFAULT_STORE_SETTINGS,
} from "@/config/settings";

export type { SerializedSettings };
export { DEFAULT_STORE_SETTINGS };

export interface ISettings extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    // Payment
    advancePaymentAmount: {
      type: Number,
      required: true,
      default: DEFAULT_STORE_SETTINGS.advancePaymentAmount,
      min: 0,
    },
    walletAccountName: {
      type: String,
      required: true,
      default: DEFAULT_STORE_SETTINGS.walletAccountName,
      trim: true,
    },
    walletAccountNumber: {
      type: String,
      required: true,
      default: DEFAULT_STORE_SETTINGS.walletAccountNumber,
      trim: true,
    },
    walletDisplayNumber: {
      type: String,
      required: true,
      default: DEFAULT_STORE_SETTINGS.walletDisplayNumber,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      default: DEFAULT_STORE_SETTINGS.bankName,
      trim: true,
    },
    bankAccountName: {
      type: String,
      required: true,
      default: DEFAULT_STORE_SETTINGS.bankAccountName,
      trim: true,
    },
    bankAccountNumber: {
      type: String,
      required: true,
      default: DEFAULT_STORE_SETTINGS.bankAccountNumber,
      trim: true,
    },
    bankIban: {
      type: String,
      required: true,
      default: DEFAULT_STORE_SETTINGS.bankIban,
      trim: true,
    },
    paymentInstructions: {
      type: String,
      default: DEFAULT_STORE_SETTINGS.paymentInstructions,
      trim: true,
    },

    // Shipping
    punjabShippingFee: {
      type: Number,
      required: true,
      default: DEFAULT_STORE_SETTINGS.punjabShippingFee,
      min: 0,
    },
    otherPakistanShippingFee: {
      type: Number,
      required: true,
      default: DEFAULT_STORE_SETTINGS.otherPakistanShippingFee,
      min: 0,
    },
    freeShippingThreshold: {
      type: Number,
      default: DEFAULT_STORE_SETTINGS.freeShippingThreshold,
      min: 0,
    },
    deliveryEstimate: {
      type: String,
      default: DEFAULT_STORE_SETTINGS.deliveryEstimate,
      trim: true,
    },

    // Contact
    whatsappNumber: {
      type: String,
      required: true,
      default: DEFAULT_STORE_SETTINGS.whatsappNumber,
      trim: true,
    },
    whatsappDisplayNumber: {
      type: String,
      required: true,
      default: DEFAULT_STORE_SETTINGS.whatsappDisplayNumber,
      trim: true,
    },
    supportEmail: {
      type: String,
      default: DEFAULT_STORE_SETTINGS.supportEmail,
      trim: true,
    },
    shopAddress: {
      type: String,
      default: DEFAULT_STORE_SETTINGS.shopAddress,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  (mongoose.models.Settings as Model<ISettings>) ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
