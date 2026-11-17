/*
 * Makes the white (monochrome) emblem for the dark footer from the colour
 * emblem: every pixel becomes white, and the darker a pixel was, the more
 * opaque it stays, so the figures keep their inner detail instead of
 * turning into one flat blob. Run: node scripts/make-emblem-white.mjs
 * Needs `sharp` (comes with Next.js).
 */
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve(import.meta.dirname, "../public/images");
const { data, info } = await sharp(path.join(DIR, "wedo365-emblem.png"))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  // 0 (dark) -> fully opaque, 255 (light) -> mostly see-through.
  const keep = Math.min(1, Math.max(0.25, 1 - (lum - 40) / 260));
  data[i] = data[i + 1] = data[i + 2] = 255;
  data[i + 3] = Math.round(data[i + 3] * keep);
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png({ compressionLevel: 9 })
  .toFile(path.join(DIR, "wedo365-emblem-white.png"));
console.log("wrote wedo365-emblem-white.png");
