const sharp = require('sharp');
const path = require('path');

const SOURCE = path.join(__dirname, '../assets/images/splash-icon.png');
const OUT_DIR = path.join(__dirname, '../public');

const BG = { r: 15, g: 15, b: 15, alpha: 1 }; // #0F0F0F

async function generate() {
  // Step 1: Load source and find logo bounding box
  const image = sharp(SOURCE);
  const { width: srcW, height: srcH } = await image.metadata();
  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (brightness > 80 && data[idx + 3] > 10) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;
  console.log(`Logo bounding box: ${minX},${minY} → ${maxX},${maxY} (size ${bboxW}x${bboxH})`);

  // Step 2: Extract logo region and center it in a square canvas
  const logoSize = Math.max(bboxW, bboxH);
  const extracted = sharp(SOURCE)
    .extract({ left: minX, top: minY, width: bboxW, height: bboxH })
    .extend({
      top: Math.floor((logoSize - bboxH) / 2),
      bottom: Math.ceil((logoSize - bboxH) / 2),
      left: Math.floor((logoSize - bboxW) / 2),
      right: Math.ceil((logoSize - bboxW) / 2),
      background: BG,
    });

  // Step 3: Generate PWA icons from centered logo
  await extracted
    .clone()
    .resize(192, 192, { fit: 'contain', background: BG })
    .png()
    .toFile(path.join(OUT_DIR, 'icon-192.png'));
  console.log('Generated icon-192.png');

  await extracted
    .clone()
    .resize(512, 512, { fit: 'contain', background: BG })
    .png()
    .toFile(path.join(OUT_DIR, 'icon-512.png'));
  console.log('Generated icon-512.png');

  await extracted
    .clone()
    .resize(180, 180, { fit: 'contain', background: BG })
    .png()
    .toFile(path.join(OUT_DIR, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Step 4: Also generate a centered splash-icon for reference
  await extracted
    .clone()
    .resize(1024, 1024, { fit: 'contain', background: BG })
    .png()
    .toFile(path.join(__dirname, '../assets/images/splash-icon-centered.png'));
  console.log('Generated splash-icon-centered.png (reference)');

  console.log('All PWA icons generated successfully with centered logo.');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
