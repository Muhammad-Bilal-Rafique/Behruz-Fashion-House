/**
 * Admin Session Token Service (Edge & Node runtime compatible)
 * Uses Web Crypto API (HMAC-SHA256) for zero-dependency, ultra-fast token signing.
 */

export const ADMIN_COOKIE_NAME = "bfh_admin_session";

// Fallback secret if ADMIN_SESSION_SECRET is not configured
const FALLBACK_SECRET = "bfh-couture-admin-secure-auth-secret-key-2026";

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || FALLBACK_SECRET;
}

// Helper to convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Helper to encode Uint8Array to base64url
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Helper to decode base64url to Uint8Array
function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const secretBytes = stringToUint8Array(getSecretKey());
  return await crypto.subtle.importKey(
    "raw",
    secretBytes as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface AdminTokenPayload {
  email: string;
  role: "admin";
  iat: number;
  exp: number;
}

/**
 * Creates a signed JWT-like session token valid for a specified number of days.
 */
export async function createAdminSessionToken(
  email: string,
  expiresInDays: number = 7
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInDays * 24 * 60 * 60;

  const payload: AdminTokenPayload = {
    email: email.toLowerCase().trim(),
    role: "admin",
    iat: now,
    exp,
  };

  const payloadString = JSON.stringify(payload);
  const payloadEncoded = base64UrlEncode(stringToUint8Array(payloadString));

  const key = await getCryptoKey();
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    stringToUint8Array(payloadEncoded) as BufferSource
  );
  const signatureEncoded = base64UrlEncode(new Uint8Array(signatureBytes));

  return `${payloadEncoded}.${signatureEncoded}`;
}

/**
 * Verifies the signed session token. Edge runtime safe.
 */
export async function verifyAdminSessionToken(
  token: string | null | undefined
): Promise<{ valid: boolean; email?: string }> {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadEncoded, signatureEncoded] = parts;

  try {
    const key = await getCryptoKey();
    const signatureBytes = base64UrlDecode(signatureEncoded);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as BufferSource,
      stringToUint8Array(payloadEncoded) as BufferSource
    );

    if (!isValid) {
      return { valid: false };
    }

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadEncoded));
    const payload: AdminTokenPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false };
    }

    return {
      valid: true,
      email: payload.email,
    };
  } catch (err) {
    return { valid: false };
  }
}
