"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/admin-token";
import { authenticateAdmin } from "@/lib/admin-service";
import { checkRateLimit } from "@/lib/rate-limit";

export interface LoginActionResult {
  success: boolean;
  message?: string;
  redirectUrl?: string;
}

/**
 * Authenticates admin and establishes an HTTP-only signed session cookie.
 */
export async function loginAdminAction(
  prevState: any,
  formData: FormData
): Promise<LoginActionResult> {
  const emailOrIdentifier = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";
  const callbackUrl = (formData.get("callbackUrl") as string) || "/admin/dashboard";

  // Rate limit: 5 attempts per 15 minutes per email/identifier
  const rateLimit = checkRateLimit(
    `login_${emailOrIdentifier.trim().toLowerCase() || "anon"}`,
    5,
    15 * 60 * 1000
  );
  if (!rateLimit.allowed) {
    const minsLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return {
      success: false,
      message: `Too many failed login attempts. Please try again in ${minsLeft} minute(s).`,
    };
  }

  const authResult = await authenticateAdmin(emailOrIdentifier, password);

  if (!authResult.success || !authResult.email) {
    return {
      success: false,
      message: authResult.message || "Invalid email or password.",
    };
  }

  // Create 7-day cryptographically signed session token
  const sessionToken = await createAdminSessionToken(authResult.email, 7);

  // Set HTTP-only, secure session cookie
  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });

  // Safe redirect fallback (ensure no open redirect vulnerabilities)
  const safeRedirect = callbackUrl.startsWith("/admin")
    ? callbackUrl
    : "/admin/dashboard";

  return {
    success: true,
    redirectUrl: safeRedirect,
  };
}

/**
 * Logs out the admin by wiping the session cookie and redirecting to the login page.
 */
export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

/**
 * Helper to check current admin session on the server.
 */
export async function getCurrentAdminSession(): Promise<{
  authenticated: boolean;
  email?: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, email } = await verifyAdminSessionToken(token);
  return { authenticated: valid, email };
}
