/*
 * node scripts/process-team-photo.mjs
 *
 * Makes the team photo band at the top of the home page from
 * design-assets/home-page1.jpeg (2040×1530). home-page.jpeg is rejected
 * (a readable "Victoriahem" lanyard in the foreground, one person cut by the
 * edge); home-page2.jpeg is byte-identical to home-page1.jpeg.
 *
 * Three crops keep all six faces fully in frame at any width. Each is the
 * full 2040px width (no upscaling) and only the rows differ. sharp drops
 * all metadata (EXIF, GPS) unless asked to keep it. Next.js then serves
 * AVIF/WebP. The blur placeholders are merged into src/config/image-blur.ts
 * (the other photos' entries are left alone: their originals are not all in
 * design-assets/ any more, so process-images.mjs cannot be re-run in full).
 *
 * The crops here must match TEAM_PHOTO in src/config/images.ts.
 */
import fs from "node:fs";
import path from "node:path";
import * as prettier from "prettier";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "design-assets/home-page1.jpeg");
const OUT = path.join(ROOT, "public/images");

const WIDTH = 2040;
const CROPS = [
  // Desktop and tablet, 3.23:1. Ends just below the front-left chin.
  { name: "team-wedo365-landscape", top: 138, height: 632 },
  // Large phones, 2.4:1.
  { name: "team-wedo365-tablet", top: 20, height: 850 },
  // Phones, 4:3: the whole photo.
  { name: "team-wedo365-phone", top: 0, height: 1530 },
];

const blur = {};
for (const { name, top, height } of CROPS) {
  const frame = sharp(SOURCE)
    .rotate()
    .extract({ left: 0, top, width: WIDTH, height });
  await frame
    .clone()
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(path.join(OUT, `${name}.jpg`));
  const tiny = await frame
    .clone()
    .resize(16, Math.round((16 * height) / WIDTH) || 1)
    .jpeg({ quality: 60 })
    .toBuffer();
  blur[name] = `data:image/jpeg;base64,${tiny.toString("base64")}`;
}

const blurFile = path.join(ROOT, "src/config/image-blur.ts");
let text = fs.readFileSync(blurFile, "utf8");
for (const k of Object.keys(blur)) {
  // Prettier may wrap a long entry onto two lines.
  text = text.replace(new RegExp(`\\n\\s*"${k}":\\s*"[^"]*",`), "");
}
const added = Object.entries(blur)
  .map(([k, v]) => `  "${k}": "${v}",\n`)
  .join("");
text = text.replace(/\n};\s*$/, `\n${added}};\n`);
fs.writeFileSync(blurFile, await prettier.format(text, { filepath: blurFile }));
console.log("done:", Object.keys(blur).join(", "));
