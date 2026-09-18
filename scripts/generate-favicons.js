const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Helper to assemble PNG buffers into a multi-resolution ICO file
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  // Header: 6 bytes
  // Directory entries: 16 bytes each
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Size
    entry.writeUInt32LE(offset, 12); // Offset
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((i) => i.buffer)]);
}

async function generate() {
  console.log('Generating Behruz Fashion House favicons...');

  // 1. Process logo.png to extract clean transparent logo with proper alpha feathering
  const { data, info } = await sharp('public/logo.png').raw().toBuffer({ resolveWithObject: true });
  const transparent = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    transparent[i] = r;
    transparent[i+1] = g;
    transparent[i+2] = b;
    if (r >= 252 && g >= 252 && b >= 252) {
      transparent[i+3] = 0;
    } else if (r > 235 && g > 235 && b > 235) {
      const minVal = Math.min(r, g, b);
      transparent[i+3] = Math.max(0, Math.min(255, Math.round((255 - minVal) * 12)));
    } else {
      transparent[i+3] = 255;
    }
  }

  const logoTransBuf = await sharp(transparent, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  // Create high-res 512x512 master icon with clean margins
  const masterIcon512 = await sharp(logoTransBuf)
    .resize(480, 480, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: 16,
      bottom: 16,
      left: 16,
      right: 16,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  // Write master icons:
  // 1. src/app/icon.png (512x512)
  fs.writeFileSync('src/app/icon.png', masterIcon512);
  fs.writeFileSync('public/icon.png', masterIcon512);
  console.log('Created src/app/icon.png & public/icon.png (512x512)');

  // 2. Apple touch icon (180x180) on clean white luxury square canvas
  // Apple recommends non-transparent background for home screen icons
  const appleSvgBg = Buffer.from(
    '<svg width="180" height="180"><rect width="180" height="180" rx="40" fill="#ffffff"/></svg>'
  );
  const logoForApple = await sharp(logoTransBuf)
    .resize(150, 150, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toBuffer();

  const appleIcon = await sharp(appleSvgBg)
    .composite([{ input: logoForApple, gravity: 'center' }])
    .png()
    .toBuffer();

  fs.writeFileSync('src/app/apple-icon.png', appleIcon);
  fs.writeFileSync('public/apple-icon.png', appleIcon);
  console.log('Created src/app/apple-icon.png & public/apple-icon.png (180x180)');

  // 3. Multi-resolution favicon.ico (16x16, 32x32, 48x48)
  const [b16, b32, b48] = await Promise.all([
    sharp(masterIcon512).resize(16, 16, { fit: 'contain' }).png().toBuffer(),
    sharp(masterIcon512).resize(32, 32, { fit: 'contain' }).png().toBuffer(),
    sharp(masterIcon512).resize(48, 48, { fit: 'contain' }).png().toBuffer(),
  ]);

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: b16 },
    { width: 32, height: 32, buffer: b32 },
    { width: 48, height: 48, buffer: b48 },
  ]);

  fs.writeFileSync('src/app/favicon.ico', icoBuffer);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  console.log('Created src/app/favicon.ico & public/favicon.ico (multi-resolution 16, 32, 48)');

  // 4. Also create 192x192 android-chrome icon
  const icon192 = await sharp(masterIcon512).resize(192, 192, { fit: 'contain' }).png().toBuffer();
  fs.writeFileSync('public/icon-192.png', icon192);
  fs.writeFileSync('public/icon-512.png', masterIcon512);
  console.log('Created public/icon-192.png & public/icon-512.png');
}

generate().catch(console.error);
