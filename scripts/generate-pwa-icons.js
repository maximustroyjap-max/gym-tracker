const sharp = require('sharp');
const path = require('path');

const SOURCE = path.join(__dirname, '../assets/images/splash-icon.png');
const OUT_DIR = path.join(__dirname, '../public');

async function generate() {
  const image = sharp(SOURCE);

  await image
    .clone()
    .resize(192, 192, { fit: 'contain', background: { r: 15, g: 15, b: 15, alpha: 1 } })
    .png()
    .toFile(path.join(OUT_DIR, 'icon-192.png'));
  console.log('Generated icon-192.png');

  await image
    .clone()
    .resize(512, 512, { fit: 'contain', background: { r: 15, g: 15, b: 15, alpha: 1 } })
    .png()
    .toFile(path.join(OUT_DIR, 'icon-512.png'));
  console.log('Generated icon-512.png');

  await image
    .clone()
    .resize(180, 180, { fit: 'contain', background: { r: 15, g: 15, b: 15, alpha: 1 } })
    .png()
    .toFile(path.join(OUT_DIR, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  console.log('All PWA icons generated successfully.');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
