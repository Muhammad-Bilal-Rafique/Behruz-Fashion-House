/**
 * Client-side image compression utility using HTML Canvas.
 * Resizes large camera photos (e.g. 10MB+ from mobile phones) down to web-friendly sizes (~200KB - 500KB)
 * while maintaining crisp resolution for e-commerce displays.
 * 
 * This ensures uploads:
 * 1. Stay well under Vercel's hard 4.5 MB request body limit.
 * 2. Upload instantly over 3G/4G/5G mobile connections without timing out.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    maxSizeMB = 0.5,
  } = options;

  // If not an image or already smaller than 300KB, no need to compress heavily
  if (!file.type.startsWith("image/") || file.size < 300 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    // Check if window and Canvas are available (client-side only)
    if (typeof window === "undefined" || typeof document === "undefined") {
      return resolve(file);
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Calculate proportional dimensions
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(file);
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Determine format: PNG with alpha stays PNG or WebP, otherwise JPEG for smallest size
      const isPng = file.type === "image/png";
      const mimeType = isPng ? "image/webp" : "image/jpeg";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          // If compressed blob is somehow larger than original, return original
          if (blob.size >= file.size) {
            return resolve(file);
          }

          const fileExtension = mimeType === "image/webp" ? ".webp" : ".jpg";
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + fileExtension;

          const compressedFile = new File([blob], newFileName, {
            type: mimeType,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original if image fails to load
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses an array of image files in parallel.
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}
