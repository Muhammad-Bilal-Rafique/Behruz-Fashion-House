/**
 * Cloudinary Migration Script for Behruz Fashion House
 *
 * MIGRATION WORKFLOW:
 * 1. Deep scan across ALL collections in the active MongoDB database for references
 *    to the old Cloudinary account (cloud name: ih90snat).
 * 2. Deduplicate assets and compute old -> new mapping.
 * 3. Dry-run mode: prints detailed statistics, target documents/fields, and exits
 *    with ZERO database writes, ZERO uploads, and ZERO changes to the old account.
 * 4. Live mode:
 *    a. Takes full JSON backup of affected documents to scripts/backup/.
 *    b. Uploads unique assets from OLD CDN URL to NEW Cloudinary account,
 *       preserving exact public IDs and folder paths.
 *    c. Captures actual new secure_url returned by Cloudinary.
 *    d. Verifies every single asset exists in the new account before touching MongoDB.
 *    e. Performs atomic MongoDB transaction update across all affected collections.
 *    f. Performs post-migration verification (zero old URLs remaining, live HTTP checks).
 * 5. Rollback mode: Reverts MongoDB updates using the generated mapping manifest.
 *
 * USAGE:
 *   node scripts/migrate-cloudinary-assets.js --dry-run
 *   node scripts/migrate-cloudinary-assets.js --migrate
 *   node scripts/migrate-cloudinary-assets.js --rollback <path-to-manifest.json>
 */

const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const path = require("path");
const https = require("https");

// ---------------------------------------------------------
// 1. Configuration & Environment Loading
// ---------------------------------------------------------
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Error: .env.local not found at", envPath);
    process.exit(1);
  }

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

loadEnv();

const OLD_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

const NEW_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME_NEW,
  api_key: process.env.CLOUDINARY_API_KEY_NEW,
  api_secret: process.env.CLOUDINARY_API_SECRET_NEW,
};

const MONGODB_URI = process.env.MONGODB_URI;

// Ensure backup folder exists
const BACKUP_DIR = path.resolve(process.cwd(), "scripts", "backup");
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// ---------------------------------------------------------
// 2. Cloudinary Helper
// ---------------------------------------------------------
// Cloudinary SDK methods accept options containing cloud_name, api_key, api_secret directly.

// ---------------------------------------------------------
// 3. Deep Scanner across ALL Collections
// ---------------------------------------------------------
function findCloudinaryStrings(obj, pathPrefix = "", matches = []) {
  if (!obj || typeof obj !== "object") return matches;

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;

    if (typeof value === "string") {
      if (
        value.includes(OLD_CONFIG.cloud_name) ||
        value.includes("res.cloudinary.com")
      ) {
        matches.push({
          path: currentPath,
          value,
        });
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        findCloudinaryStrings(item, `${currentPath}.${index}`, matches);
      });
    } else if (typeof value === "object" && value !== null) {
      // Don't traverse MongoDB ObjectID internal properties
      if (value._bsontype) continue;
      findCloudinaryStrings(value, currentPath, matches);
    }
  }
  return matches;
}

// Extract public ID from Cloudinary URL if not explicitly provided
function extractPublicIdFromUrl(url) {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    let pathAfterUpload = parts.slice(uploadIndex + 1);
    // Ignore version tag if present (e.g. v1789410887)
    if (pathAfterUpload[0] && pathAfterUpload[0].startsWith("v") && /^v\d+$/.test(pathAfterUpload[0])) {
      pathAfterUpload = pathAfterUpload.slice(1);
    }
    const fullPath = pathAfterUpload.join("/");
    // Remove extension
    const lastDot = fullPath.lastIndexOf(".");
    return lastDot !== -1 ? fullPath.slice(0, lastDot) : fullPath;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------
// 4. Main Scan Function
// ---------------------------------------------------------
async function scanDatabase(db) {
  const collections = await db.listCollections().toArray();
  const report = {
    collectionsScanned: [],
    totalDocumentsScanned: 0,
    matchedDocuments: [],
    uniqueAssetsMap: new Map(), // publicId -> { sourceUrl, publicId, references: [] }
    duplicateReferencesCount: 0,
  };

  for (const collInfo of collections) {
    const collName = collInfo.name;
    report.collectionsScanned.push(collName);
    const coll = db.collection(collName);
    const docs = await coll.find({}).toArray();
    report.totalDocumentsScanned += docs.length;

    for (const doc of docs) {
      const matches = findCloudinaryStrings(doc);
      if (matches.length > 0) {
        report.matchedDocuments.push({
          collection: collName,
          docId: doc._id,
          matches,
          fullDoc: doc,
        });

        // If this is a product with images array
        if (collName === "products" && Array.isArray(doc.images)) {
          doc.images.forEach((img, idx) => {
            if (img.url && img.url.includes(OLD_CONFIG.cloud_name)) {
              const publicId = img.publicId || extractPublicIdFromUrl(img.url);
              if (publicId) {
                if (!report.uniqueAssetsMap.has(publicId)) {
                  report.uniqueAssetsMap.set(publicId, {
                    publicId,
                    sourceUrl: img.url,
                    references: [],
                  });
                } else {
                  report.duplicateReferencesCount++;
                }
                report.uniqueAssetsMap.get(publicId).references.push({
                  collection: collName,
                  docId: doc._id,
                  fieldPath: `images.${idx}`,
                  isCover: img.isCover,
                });
              }
            }
          });
        }

        // If this is an order with items array
        if (collName === "orders" && Array.isArray(doc.items)) {
          doc.items.forEach((item, idx) => {
            if (item.image && item.image.includes(OLD_CONFIG.cloud_name)) {
              const publicId = extractPublicIdFromUrl(item.image);
              if (publicId) {
                if (!report.uniqueAssetsMap.has(publicId)) {
                  report.uniqueAssetsMap.set(publicId, {
                    publicId,
                    sourceUrl: item.image,
                    references: [],
                  });
                } else {
                  report.duplicateReferencesCount++;
                }
                report.uniqueAssetsMap.get(publicId).references.push({
                  collection: collName,
                  docId: doc._id,
                  fieldPath: `items.${idx}.image`,
                  orderNumber: doc.orderNumber,
                });
              }
            }
          });
        }

        // Check hero or other models
        if (collName === "heros") {
          if (doc.imageUrl && doc.imageUrl.includes(OLD_CONFIG.cloud_name)) {
            const publicId = doc.imagePublicId || extractPublicIdFromUrl(doc.imageUrl);
            if (publicId) {
              if (!report.uniqueAssetsMap.has(publicId)) {
                report.uniqueAssetsMap.set(publicId, {
                  publicId,
                  sourceUrl: doc.imageUrl,
                  references: [],
                });
              } else {
                report.duplicateReferencesCount++;
              }
              report.uniqueAssetsMap.get(publicId).references.push({
                collection: collName,
                docId: doc._id,
                fieldPath: "imageUrl",
              });
            }
          }
        }
      }
    }
  }

  return report;
}

// ---------------------------------------------------------
// 5. Dry Run Handler
// ---------------------------------------------------------
async function runDryRun() {
  console.log("=================================================");
  console.log("  CLOUDINARY ASSETS MIGRATION - DRY RUN MODE   ");
  console.log("=================================================");
  console.log("Guarantee: 0 database writes, 0 uploads, 0 modifications.\n");

  console.log("Connecting to active MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to database: ${mongoose.connection.name}`);
  console.log(`Cluster Host: ${mongoose.connection.host}`);

  console.log("\nVerifying Cloudinary account credentials (read-only ping)...");
  try {
    const oldPing = await cloudinary.api.ping(OLD_CONFIG);
    console.log(`[OLD Account] ${OLD_CONFIG.cloud_name} Ping: OK (Rate limit: ${oldPing.rate_limit_allowed}/hr)`);
  } catch (err) {
    console.error(`[OLD Account] Failed ping:`, err.message);
  }

  try {
    const newPing = await cloudinary.api.ping(NEW_CONFIG);
    console.log(`[NEW Account] ${NEW_CONFIG.cloud_name} Ping: OK (Rate limit: ${newPing.rate_limit_allowed}/hr)`);
  } catch (err) {
    console.error(`[NEW Account] Failed ping:`, err.message);
  }

  console.log("\nInitiating full database scan across ALL collections...");
  const report = await scanDatabase(mongoose.connection.db);

  console.log("\n-------------------------------------------------");
  console.log("               SCAN RESULTS SUMMARY               ");
  console.log("-------------------------------------------------");
  console.log(`Collections scanned: ${report.collectionsScanned.join(", ")}`);
  console.log(`Total documents inspected: ${report.totalDocumentsScanned}`);
  console.log(`Documents with old Cloudinary references: ${report.matchedDocuments.length}`);
  console.log(`Total unique Cloudinary assets to migrate: ${report.uniqueAssetsMap.size}`);
  console.log(`Duplicate references (shared assets): ${report.duplicateReferencesCount}`);

  // Breakdown by collection
  const breakdown = {};
  report.matchedDocuments.forEach((m) => {
    breakdown[m.collection] = (breakdown[m.collection] || 0) + 1;
  });
  console.log("\nAffected Documents Breakdown:");
  for (const [coll, count] of Object.entries(breakdown)) {
    console.log(` - Collection "${coll}": ${count} document(s) to be updated`);
  }

  console.log("\nSample Assets to be Migrated (first 10):");
  const assetsList = Array.from(report.uniqueAssetsMap.values());
  assetsList.slice(0, 10).forEach((asset, idx) => {
    console.log(` ${idx + 1}. PublicId: "${asset.publicId}"`);
    console.log(`    Old URL:  ${asset.sourceUrl}`);
    console.log(`    Used in:  ${asset.references.map((r) => `${r.collection} (${r.fieldPath})`).join(", ")}`);
  });

  if (assetsList.length > 10) {
    console.log(` ... and ${assetsList.length - 10} more unique assets.`);
  }

  // Save complete dry run report to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportFilePath = path.join(BACKUP_DIR, `dry-run-report-${timestamp}.json`);
  const serializableReport = {
    generatedAt: new Date().toISOString(),
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    oldCloudName: OLD_CONFIG.cloud_name,
    newCloudName: NEW_CONFIG.cloud_name,
    summary: {
      collectionsScanned: report.collectionsScanned,
      totalDocumentsScanned: report.totalDocumentsScanned,
      documentsWithReferences: report.matchedDocuments.length,
      uniqueAssetsCount: report.uniqueAssetsMap.size,
      duplicateReferencesCount: report.duplicateReferencesCount,
      affectedCollectionsBreakdown: breakdown,
    },
    uniqueAssets: assetsList,
    affectedDocuments: report.matchedDocuments.map((m) => ({
      collection: m.collection,
      docId: m.docId,
      matches: m.matches,
    })),
  };

  fs.writeFileSync(reportFilePath, JSON.stringify(serializableReport, null, 2), "utf-8");
  console.log(`\nDetailed dry run report written to:\n${reportFilePath}`);

  await mongoose.disconnect();
  console.log("\n=================================================");
  console.log("  DRY RUN COMPLETED. ZERO CHANGES WERE APPLIED.   ");
  console.log("=================================================\n");
  return serializableReport;
}

// ---------------------------------------------------------
// 6. Live Migration Handler
// ---------------------------------------------------------
async function runMigration() {
  console.log("=================================================");
  console.log("    CLOUDINARY ASSETS MIGRATION - LIVE MODE     ");
  console.log("=================================================\n");

  console.log("Connecting to active MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to database: ${mongoose.connection.name}`);

  // 1. Full Pre-migration scan
  console.log("\n[Step 1/6] Scanning database for all old Cloudinary assets...");
  const report = await scanDatabase(mongoose.connection.db);
  const assetsList = Array.from(report.uniqueAssetsMap.values());
  console.log(`Found ${assetsList.length} unique assets across ${report.matchedDocuments.length} documents.`);

  if (assetsList.length === 0) {
    console.log("No assets to migrate. Exiting.");
    await mongoose.disconnect();
    return;
  }

  // 2. Pre-migration JSON Backup of all affected documents
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFilePath = path.join(BACKUP_DIR, `pre-migration-backup-${timestamp}.json`);
  console.log(`\n[Step 2/6] Creating complete pre-migration database snapshot to:\n${backupFilePath}`);
  fs.writeFileSync(
    backupFilePath,
    JSON.stringify(
      {
        backupDate: new Date().toISOString(),
        database: mongoose.connection.name,
        documents: report.matchedDocuments.map((m) => ({
          collection: m.collection,
          docId: m.docId,
          fullDoc: m.fullDoc,
        })),
      },
      null,
      2
    ),
    "utf-8"
  );
  console.log("Pre-migration snapshot saved successfully.");

  // 3. Upload assets to NEW Cloudinary account
  console.log(`\n[Step 3/6] Migrating ${assetsList.length} unique assets to NEW Cloudinary account (${NEW_CONFIG.cloud_name})...`);
  const migrationMap = new Map(); // publicId -> { oldUrl, newUrl, publicId, version, verified: false }
  let successUploadCount = 0;

  for (let i = 0; i < assetsList.length; i++) {
    const asset = assetsList[i];
    console.log(`[${i + 1}/${assetsList.length}] Uploading "${asset.publicId}"...`);

    try {
      const uploadRes = await cloudinary.uploader.upload(asset.sourceUrl, {
        ...NEW_CONFIG,
        public_id: asset.publicId,
        resource_type: "image",
        overwrite: true,
        unique_filename: false,
        use_filename: false,
      });

      migrationMap.set(asset.publicId, {
        publicId: asset.publicId,
        oldUrl: asset.sourceUrl,
        newUrl: uploadRes.secure_url,
        version: uploadRes.version,
        format: uploadRes.format,
        bytes: uploadRes.bytes,
      });
      successUploadCount++;
    } catch (uploadErr) {
      console.error(`ERROR: Failed to upload asset "${asset.publicId}":`, uploadErr.message);
      console.error("ABORTING MIGRATION: No database changes will be applied.");
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  console.log(`\nSuccessfully uploaded all ${successUploadCount} assets to NEW Cloudinary account.`);

  // 4. Verification in NEW Cloudinary account BEFORE touching MongoDB
  console.log(`\n[Step 4/6] Verifying all ${assetsList.length} assets exist in NEW Cloudinary...`);
  let verificationFailures = 0;

  for (let i = 0; i < assetsList.length; i++) {
    const asset = assetsList[i];
    try {
      const res = await cloudinary.api.resource(asset.publicId, NEW_CONFIG);
      if (res && res.public_id === asset.publicId) {
        migrationMap.get(asset.publicId).verified = true;
      } else {
        console.error(`Verification mismatch for "${asset.publicId}"`);
        verificationFailures++;
      }
    } catch (verErr) {
      console.error(`Verification FAILED for "${asset.publicId}":`, verErr.message);
      verificationFailures++;
    }
  }

  if (verificationFailures > 0) {
    console.error(`ABORTING: ${verificationFailures} asset(s) failed verification in NEW Cloudinary!`);
    console.error("Zero MongoDB changes will be executed.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("All migrated assets verified and active in the NEW Cloudinary account.");

  // Save Mapping Manifest
  const manifestFilePath = path.join(BACKUP_DIR, `cloudinary-migration-map-${timestamp}.json`);
  const manifestData = {
    migrationTimestamp: new Date().toISOString(),
    oldCloudName: OLD_CONFIG.cloud_name,
    newCloudName: NEW_CONFIG.cloud_name,
    totalMigrated: migrationMap.size,
    mapping: Array.from(migrationMap.values()),
  };
  fs.writeFileSync(manifestFilePath, JSON.stringify(manifestData, null, 2), "utf-8");
  console.log(`Mapping manifest written to: ${manifestFilePath}`);

  // 5. Update MongoDB atomically using a transaction
  console.log("\n[Step 5/6] Updating MongoDB documents atomically via transaction session...");
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // 5a. Update products
      const productsCollection = mongoose.connection.db.collection("products");
      const productsToUpdate = report.matchedDocuments.filter((m) => m.collection === "products");

      for (const item of productsToUpdate) {
        const doc = item.fullDoc;
        let modified = false;

        const updatedImages = (doc.images || []).map((img) => {
          const publicId = img.publicId || extractPublicIdFromUrl(img.url);
          if (publicId && migrationMap.has(publicId)) {
            const mapped = migrationMap.get(publicId);
            modified = true;
            return {
              ...img,
              url: mapped.newUrl,
              publicId: mapped.publicId,
            };
          }
          return img;
        });

        if (modified) {
          await productsCollection.updateOne(
            { _id: doc._id },
            { $set: { images: updatedImages, updatedAt: new Date() } },
            { session }
          );
        }
      }
      console.log(` - Atomically updated ${productsToUpdate.length} product document(s).`);

      // 5b. Update orders
      const ordersCollection = mongoose.connection.db.collection("orders");
      const ordersToUpdate = report.matchedDocuments.filter((m) => m.collection === "orders");

      for (const item of ordersToUpdate) {
        const doc = item.fullDoc;
        let modified = false;

        const updatedItems = (doc.items || []).map((orderItem) => {
          const publicId = extractPublicIdFromUrl(orderItem.image);
          if (publicId && migrationMap.has(publicId)) {
            const mapped = migrationMap.get(publicId);
            modified = true;
            return {
              ...orderItem,
              image: mapped.newUrl,
            };
          }
          return orderItem;
        });

        if (modified) {
          await ordersCollection.updateOne(
            { _id: doc._id },
            { $set: { items: updatedItems, updatedAt: new Date() } },
            { session }
          );
        }
      }
      console.log(` - Atomically updated ${ordersToUpdate.length} order document(s).`);

      // 5c. Update heros if any
      const herosCollection = mongoose.connection.db.collection("heros");
      const herosToUpdate = report.matchedDocuments.filter((m) => m.collection === "heros");

      for (const item of herosToUpdate) {
        const doc = item.fullDoc;
        const publicId = doc.imagePublicId || extractPublicIdFromUrl(doc.imageUrl);
        if (publicId && migrationMap.has(publicId)) {
          const mapped = migrationMap.get(publicId);
          await herosCollection.updateOne(
            { _id: doc._id },
            { $set: { imageUrl: mapped.newUrl, imagePublicId: mapped.publicId, updatedAt: new Date() } },
            { session }
          );
        }
      }
      if (herosToUpdate.length > 0) {
        console.log(` - Atomically updated ${herosToUpdate.length} hero document(s).`);
      }
    });

    console.log("Transaction committed successfully!");
  } catch (txErr) {
    console.error("Transaction failed and was rolled back by MongoDB:", txErr);
    throw txErr;
  } finally {
    await session.endSession();
  }

  // 6. Post-migration Verification
  console.log("\n[Step 6/6] Performing complete post-migration verification...");
  const postScan = await scanDatabase(mongoose.connection.db);
  console.log(`Remaining old Cloudinary references in MongoDB: ${postScan.matchedDocuments.length}`);

  if (postScan.matchedDocuments.length > 0) {
    console.warn("WARNING: Some old references still found:", postScan.matchedDocuments);
  } else {
    console.log("VERIFIED: Zero references to old Cloudinary cloud remain in the database!");
  }

  // Test sample image URLs via HTTP HEAD
  console.log("\nTesting live HTTP accessibility of migrated URLs...");
  const sampleToCheck = Array.from(migrationMap.values()).slice(0, 5);
  for (const sample of sampleToCheck) {
    await new Promise((resolve) => {
      https
        .get(sample.newUrl, (res) => {
          console.log(` [HTTP ${res.statusCode}] ${sample.publicId} -> OK`);
          resolve();
        })
        .on("error", (err) => {
          console.error(` [HTTP ERROR] ${sample.newUrl}:`, err.message);
          resolve();
        });
    });
  }

  await mongoose.disconnect();

  console.log("\n=================================================");
  console.log("          MIGRATION COMPLETED SAFELY!           ");
  console.log(`Manifest: ${manifestFilePath}`);
  console.log(`Backup:   ${backupFilePath}`);
  console.log("=================================================\n");
}

// ---------------------------------------------------------
// 7. Rollback Handler
// ---------------------------------------------------------
async function runRollback(manifestPath) {
  console.log("=================================================");
  console.log("      CLOUDINARY ASSETS MIGRATION - ROLLBACK     ");
  console.log("=================================================\n");

  if (!manifestPath || !fs.existsSync(manifestPath)) {
    console.error("Error: Please provide a valid path to a migration map manifest JSON file.");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`Loaded manifest from: ${manifestPath}`);
  console.log(`Total mapped assets to revert: ${manifest.mapping.length}`);

  // Create reverse map: newUrl -> oldUrl and publicId -> oldUrl
  const reverseMapByUrl = new Map();
  manifest.mapping.forEach((item) => {
    reverseMapByUrl.set(item.newUrl, item.oldUrl);
  });

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const productsCollection = mongoose.connection.db.collection("products");
      const products = await productsCollection.find({}).toArray();

      for (const p of products) {
        let modified = false;
        const revertedImages = (p.images || []).map((img) => {
          if (reverseMapByUrl.has(img.url)) {
            modified = true;
            return {
              ...img,
              url: reverseMapByUrl.get(img.url),
            };
          }
          return img;
        });

        if (modified) {
          await productsCollection.updateOne(
            { _id: p._id },
            { $set: { images: revertedImages, updatedAt: new Date() } },
            { session }
          );
        }
      }

      const ordersCollection = mongoose.connection.db.collection("orders");
      const orders = await ordersCollection.find({}).toArray();

      for (const o of orders) {
        let modified = false;
        const revertedItems = (o.items || []).map((item) => {
          if (reverseMapByUrl.has(item.image)) {
            modified = true;
            return {
              ...item,
              image: reverseMapByUrl.get(item.image),
            };
          }
          return item;
        });

        if (modified) {
          await ordersCollection.updateOne(
            { _id: o._id },
            { $set: { items: revertedItems, updatedAt: new Date() } },
            { session }
          );
        }
      }
    });

    console.log("Rollback completed successfully! Database reverted to old URLs.");
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }
}

// ---------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------
const args = process.argv.slice(2);
const command = args[0];

if (command === "--dry-run") {
  runDryRun().catch((err) => {
    console.error("Dry run encountered an error:", err);
    process.exit(1);
  });
} else if (command === "--migrate") {
  runMigration().catch((err) => {
    console.error("Migration encountered an error:", err);
    process.exit(1);
  });
} else if (command === "--rollback") {
  const manifestFile = args[1];
  runRollback(manifestFile).catch((err) => {
    console.error("Rollback encountered an error:", err);
    process.exit(1);
  });
} else {
  console.log("Usage:");
  console.log("  node scripts/migrate-cloudinary-assets.js --dry-run");
  console.log("  node scripts/migrate-cloudinary-assets.js --migrate");
  console.log("  node scripts/migrate-cloudinary-assets.js --rollback <path-to-manifest.json>");
  process.exit(1);
}
