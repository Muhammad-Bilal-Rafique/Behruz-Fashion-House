"use server";

import { sendContactInquiryEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function submitContactAction(
  data: ContactFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const message = data.message?.trim();

    if (!name || name.length < 2) {
      return { success: false, error: "Please enter your name." };
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please provide a valid email address." };
    }

    if (!message || message.length < 5) {
      return { success: false, error: "Message must be at least 5 characters long." };
    }

    // Rate limit: 5 messages per 10 minutes per email
    const rateLimit = checkRateLimit(`contact_${email}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: "You have sent too many messages recently. Please wait a few minutes.",
      };
    }

    const sent = await sendContactInquiryEmail({ name, email, message });
    if (!sent) {
      return {
        success: false,
        error: "Failed to send message via email. Please contact us on WhatsApp.",
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("submitContactAction error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
