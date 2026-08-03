#!/usr/bin/env node
/**
 * Turns a folder of phone photos into web-ready images.
 *
 * This is NOT a build step — the site still ships as plain HTML with no
 * compile. You run this by hand when you add new photos, and the output gets
 * committed alongside everything else.
 *
 *   npm run images -- <source-folder>
 *
 * For each source image it writes, into public/img/photos/:
 *   <name>-640.webp   <name>-1024.webp   <name>-1600.webp
 *   <name>-1024.jpg   (fallback for anything that cannot do WebP)
 *
 * Two things it always does:
 *   1. Strips ALL metadata. Phone photos carry GPS coordinates in EXIF, and
 *      these are photos of children taken at home. That data must not ship.
 *   2. Applies EXIF orientation before stripping it, so portrait photos do not
 *      come out sideways.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = process.argv[2];
const OUT = 'public/img/photos';
const WIDTHS = [640, 1024, 1600];

if (!SRC) {
  console.error('usage: node scripts/optimize-images.js <source-folder>');
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter(f => /\.(jpe?g|png|heic|webp)$/i.test(f));
if (!files.length) {
  console.error(`no images found in ${SRC}`);
  process.exit(1);
}

(async () => {
  for (const file of files) {
    const name = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const src = path.join(SRC, file);
    const meta = await sharp(src).metadata();

    for (const w of WIDTHS) {
      if (meta.width && meta.width < w && w !== WIDTHS[0]) continue;  // never upscale
      await sharp(src)
        .rotate()                       // honour EXIF orientation first
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(OUT, `${name}-${w}.webp`));
    }

    await sharp(src)
      .rotate()
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OUT, `${name}-1024.jpg`));

    const outs = fs.readdirSync(OUT).filter(f => f.startsWith(name + '-'));
    const bytes = outs.reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
    console.log(`${file}  ${meta.width}x${meta.height} -> ${outs.length} files, ${(bytes / 1024).toFixed(0)}KB total`);
  }

  // Prove the metadata is gone rather than assuming it.
  const check = fs.readdirSync(OUT).filter(f => f.endsWith('.jpg'))[0];
  if (check) {
    const m = await sharp(path.join(OUT, check)).metadata();
    console.log(`\nmetadata check on ${check}: exif=${!!m.exif} gps=${!!(m.exif && String(m.exif).includes('GPS'))}`);
  }
})();
