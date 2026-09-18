const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
}

loadEnv();

const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

async function organizeFolders() {
  const backupDir = path.resolve(process.cwd(), 'scripts', 'backup');
  const files = fs.readdirSync(backupDir);
  const manifestFile = files.filter((f) => f.startsWith('cloudinary-migration-map')).sort().pop();

  if (!manifestFile) {
    console.error('No migration manifest found in scripts/backup/');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(backupDir, manifestFile), 'utf-8'));
  console.log(`Organizing ${manifest.mapping.length} assets into Cloudinary UI folders...`);

  let updated = 0;
  for (let i = 0; i < manifest.mapping.length; i++) {
    const item = manifest.mapping[i];
    try {
      await cloudinary.api.update(item.publicId, {
        ...config,
        asset_folder: 'behruz-fashion/products',
      });
      updated++;
      if (updated % 15 === 0 || updated === manifest.mapping.length) {
        console.log(`Updated ${updated}/${manifest.mapping.length} assets...`);
      }
    } catch (err) {
      console.error(`Failed on ${item.publicId}:`, err.message);
    }
  }

  console.log(`Complete! All ${updated} assets assigned to UI folder: "behruz-fashion/products"`);
}

organizeFolders().catch(console.error);
