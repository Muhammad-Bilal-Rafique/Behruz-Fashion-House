/**
 * Utility function to conditionally combine class names without external dependencies.
 */
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(" ");
}

/**
 * Calculates discount percentage cleanly and safely.
 * Returns 0 if originalPrice <= discountedPrice, or if originalPrice <= 0.
 * Formula: Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (
    !originalPrice ||
    originalPrice <= 0 ||
    !discountedPrice ||
    discountedPrice >= originalPrice
  ) {
    return 0;
  }
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}
