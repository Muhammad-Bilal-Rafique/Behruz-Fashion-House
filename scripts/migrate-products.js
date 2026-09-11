/**
 * Non-destructive migration script for Behruz Fashion House.
 *
 * PURPOSE:
 * Checks MongoDB for documents created with the previous schema (using `price` and `colors: string[]`)
 * and safely updates them to the new schema:
 *   - `originalPrice`: doc.price
 *   - `discountedPrice`: doc.price
 *
 * SAFETY GUARANTEES:
 * - Does NOT delete any product documents.
 * - Does NOT delete any images or Cloudinary assets.
 * - Leaves old fields archived rather than destroyed.
 *
 * USAGE:
 * node scripts/migrate-products.js
 */

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Read .env.local manually if dotenv is not installed
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

async function runMigration() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI not found in environment or .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(uri, { dbName: "behruz-fashion-house" });
    console.log("Connected successfully to database: behruz-fashion-house");

    const collection = mongoose.connection.collection("products");
    const count = await collection.countDocuments();
    console.log(`Total product documents in collection: ${count}`);

    if (count === 0) {
      console.log("No products found in the database. No migration required.");
      process.exit(0);
    }

    // Find documents that still use old schema (have price, missing originalPrice, or missing sizeStock)
    const oldDocs = await collection
      .find({
        $or: [
          { originalPrice: { $exists: false } },
          { discountedPrice: { $exists: false } },
          { price: { $exists: true } },
          { sizeStock: { $exists: false } },
          { sizeStock: { $eq: null } },
        ],
      })
      .toArray();

    console.log(`Found ${oldDocs.length} document(s) requiring schema migration.`);

    for (const doc of oldDocs) {
      const fallbackPrice = Number(doc.price || doc.originalPrice || 0);
      const originalPrice = Number(doc.originalPrice ?? fallbackPrice);
      const discountedPrice = Number(doc.discountedPrice ?? fallbackPrice);

      // Generate default sizeStock for sizes if missing
      let sizeStock = doc.sizeStock;
      if (!Array.isArray(sizeStock) || sizeStock.length === 0) {
        const sizes = Array.isArray(doc.sizes) && doc.sizes.length > 0 ? doc.sizes : ["S", "M", "L"];
        sizeStock = sizes.map((s) => ({ size: s, stock: 10 }));
      }

      console.log(
        `- Migrating product "${doc.name}" (_id: ${doc._id}): originalPrice=${originalPrice}, discountedPrice=${discountedPrice}, sizeStock=${JSON.stringify(sizeStock)}`
      );

      await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            originalPrice: originalPrice > 0 ? originalPrice : 1,
            discountedPrice: discountedPrice > 0 ? discountedPrice : (originalPrice > 0 ? originalPrice : 1),
            sizeStock,
            migratedAt: new Date(),
          },
        }
      );
    }

    console.log("Migration completed successfully. Zero documents deleted.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runMigration();
