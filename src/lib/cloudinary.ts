import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (
  buffer: Buffer,
  folder = "behruz-fashion/hero"
) => {
  return new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [
              { width: 1920, height: 1920, crop: "limit" }, // Proportional scale-down for 4K/huge photos
              { quality: "auto" },                           // Smart perceptual compression
              { fetch_format: "auto" },                      // Automatically converts to WebP/AVIF
            ],
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        )
        .end(buffer);
    }
  );
};

export const deleteFromCloudinary = async (publicId: string) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("Deleted old Cloudinary image:", publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

// Convenient aliases
export const uploadHeroImage = uploadToCloudinary;
export const deleteHeroImage = deleteFromCloudinary;

export default cloudinary;
