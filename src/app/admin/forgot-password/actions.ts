"use server";

import {
  requestPasswordResetCode,
  resetAdminPasswordWithCode,
} from "@/lib/admin-service";
import { checkRateLimit } from "@/lib/rate-limit";

export interface RequestResetResult {
  success: boolean;
  message: string;
  email?: string;
  maskedEmail?: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message: string;
}

/**
 * Server action to request a 6-digit OTP sent to the admin email.
 */
export async function requestPasswordResetAction(
  email?: string
): Promise<RequestResetResult> {
  const normalizedEmail = (email || "").trim().toLowerCase();

  // Rate limit: 3 requests per 15 minutes
  const rateKey = `pwd_reset_req_${normalizedEmail || "admin"}`;
  const rateLimit = checkRateLimit(rateKey, 3, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    const minsLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return {
      success: false,
      message: `Too many password reset requests. Please wait ${minsLeft} minute(s) before trying again.`,
    };
  }

  return await requestPasswordResetCode(normalizedEmail);
}

/**
 * Server action to verify the 6-digit OTP and reset the admin password.
 */
export async function resetPasswordWithCodeAction(
  code: string,
  newPassword: string,
  email?: string
): Promise<ResetPasswordResult> {
  const normalizedEmail = (email || "").trim().toLowerCase();

  // Rate limit: 6 attempts per 10 minutes
  const rateKey = `pwd_reset_verify_${normalizedEmail || "admin"}`;
  const rateLimit = checkRateLimit(rateKey, 6, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    const minsLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return {
      success: false,
      message: `Too many attempts. Please wait ${minsLeft} minute(s) before trying again.`,
    };
  }

  return await resetAdminPasswordWithCode(code, newPassword, normalizedEmail);
}
