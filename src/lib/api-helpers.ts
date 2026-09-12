/**
 * Universal API response and error formatting utilities.
 * Ensures users always see meaningful, human-friendly guidance instead of
 * raw developer syntax errors (such as "Unexpected token 'R'", "Request Entity Too Large", or "Failed to fetch").
 */

export interface ApiResponseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Safely parses an HTTP Response from fetch.
 * Handles plain-text errors (like Vercel's "Request Entity Too Large"),
 * HTML error pages, and non-JSON payloads without throwing SyntaxErrors.
 */
export async function safeParseApiResponse<T = any>(
  res: Response,
  fallbackMessage = "Unable to complete request. Please try again."
): Promise<ApiResponseResult<T>> {
  // 1. Check HTTP Status Codes directly
  if (res.status === 413) {
    return {
      success: false,
      error: "The uploaded photos are too large to process. Please select smaller photos or upload fewer at a time.",
    };
  }

  if (res.status === 504 || res.status === 408) {
    return {
      success: false,
      error: "The upload timed out due to a slow or unstable network. Please check your internet connection and try again.",
    };
  }

  // 2. Read body as text first to safely inspect content before JSON parsing
  let rawText = "";
  try {
    rawText = await res.text();
  } catch {
    return {
      success: false,
      error: "Failed to read server response. Please check your connection.",
    };
  }

  const lowerText = rawText.toLowerCase();

  // 3. Detect edge proxy error signatures (Vercel / Cloudflare / Nginx)
  if (
    lowerText.includes("request entity too large") ||
    lowerText.includes("function_payload_too_large") ||
    lowerText.includes("413 payload too large")
  ) {
    return {
      success: false,
      error: "The uploaded photos exceed the upload limit. Please select smaller images or upload fewer at a time.",
    };
  }

  if (lowerText.includes("gateway time-out") || lowerText.includes("504 gateway timeout")) {
    return {
      success: false,
      error: "The request timed out. Please check your network connection and try again.",
    };
  }

  // 4. Safely parse JSON if available
  try {
    const json = JSON.parse(rawText);
    if (!res.ok || json.success === false) {
      return {
        success: false,
        error: json.error || json.message || fallbackMessage,
      };
    }
    return {
      success: true,
      data: json,
    };
  } catch {
    // Non-JSON response (e.g. plain text or HTML error page)
    if (res.status >= 500) {
      return {
        success: false,
        error: "The server encountered a temporary issue. Please try again in a moment.",
      };
    }
    return {
      success: false,
      error: fallbackMessage,
    };
  }
}

/**
 * Translates low-level browser exceptions (e.g. "Failed to fetch", JSON SyntaxError)
 * into friendly, actionable guidance for real users.
 */
export function getFriendlyErrorMessage(
  err: unknown,
  defaultMessage = "Something went wrong. Please try again."
): string {
  if (!err) return defaultMessage;

  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  // Network connection drops or fetch failures
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("load failed")
  ) {
    return "Network connection issue or upload timed out. Please check your internet connection and try again.";
  }

  // HTTP 413 or payload limits
  if (
    lower.includes("request entity too large") ||
    lower.includes("payload too large") ||
    lower.includes("payload_too_large") ||
    lower.includes("413")
  ) {
    return "The uploaded images are too large. Please select smaller photos or upload fewer images.";
  }

  // JSON SyntaxErrors (like "Unexpected token 'R', "Request En"...")
  if (lower.includes("is not valid json") || lower.includes("unexpected token")) {
    return "The upload could not be completed because the files were too large for the server. Please try with smaller photos.";
  }

  // Abort / timeout
  if (lower.includes("abort") || lower.includes("timeout")) {
    return "The request took too long and was cancelled. Please check your connection and try again.";
  }

  return message;
}
