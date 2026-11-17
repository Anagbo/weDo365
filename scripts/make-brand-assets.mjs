/*
 * Makes the icon set and the share image from files in the repo:
 *   node scripts/make-brand-assets.mjs
 *
 *   src/app/icon.svg        scalable tab icon (green tile, white W)
 *   src/app/icon1.png       32 x 32
 *   src/app/icon2.png       512 x 512
 *   src/app/apple-icon.png  180 x 180 (apple-touch-icon)
 *   src/app/favicon.ico     32 x 32 (a PNG inside an ICO), for crawlers and old browsers
 *   public/og-image.jpg     1200 x 630 share image (Open Graph and Twitter)
 *
 * The W is drawn as a path, so no font is needed. This is a stand-in until
 * the owner supplies a real square emblem: replace icon.svg and rerun.
 * Needs `sharp` (comes with Next.js).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const APP = path.join(ROOT, "src/app");
const GREEN = "#2f5d4a";

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${GREEN}"/>
  <path d="M15 19l8 26 9-20 9 20 8-26" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
fs.writeFileSync(path.join(APP, "icon.svg"), icon);

const png = (size) =>
  sharp(Buffer.from(icon), { density: (72 * size) / 64 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();

fs.writeFileSync(path.join(APP, "icon1.png"), await png(32));
fs.writeFileSync(path.join(APP, "icon2.png"), await png(512));
fs.writeFileSync(path.join(APP, "apple-icon.png"), await png(180));

// ICO with one 32x32 PNG image.
const ico32 = await png(32);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header[6] = 32; // width
header[7] = 32; // height
header.writeUInt16LE(1, 12); // colour planes
header.writeUInt16LE(32, 14); // bits per pixel
header.writeUInt32LE(ico32.length, 16); // size of image data
header.writeUInt32LE(22, 18); // offset of image data
fs.writeFileSync(path.join(APP, "favicon.ico"), Buffer.concat([header, ico32]));

// Share image: a photo from the site, dark band with the white emblem below.
const W = 1200;
const H = 630;
const BAND = 170;
const photo = await sharp(
  path.join(ROOT, "public/images/slide-mirror-orchid.jpg"),
)
  .resize(W, H - BAND, { fit: "cover", position: sharp.strategy.attention })
  .toBuffer();
const emblem = await sharp(
  path.join(ROOT, "public/images/wedo365-emblem-white.png"),
)
  .resize({ height: 120 })
  .toBuffer();
const emblemMeta = await sharp(emblem).metadata();
const wordmark = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="120">
     <text x="0" y="86" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="76" fill="#fff">WeDo365</text>
   </svg>`,
);
await sharp({
  create: { width: W, height: H, channels: 3, background: "#1e2a24" },
})
  .composite([
    { input: photo, left: 0, top: 0 },
    { input: emblem, left: 56, top: H - BAND + 25 },
    {
      input: wordmark,
      left: 56 + (emblemMeta.width ?? 290) + 28,
      top: H - BAND + 25,
    },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(ROOT, "public/og-image.jpg"));

console.log("wrote icons and public/og-image.jpg");
