/*
 * node scripts/process-video.mjs
 *
 * Publishes design-assets/video.mp4 as the "business band" background video
 * (SiteVideo / IMAGES.businessBand in src/app/[locale]/page.tsx):
 *   1. Copies it as-is to public/videos/business-band.mp4 (no transcoding —
 *      see note below).
 *   2. Extracts a poster frame to design-assets/business-band-poster.jpg,
 *      which scripts/process-images.mjs then turns into the 4:5 photo +
 *      blur placeholder used for the <video poster> and the no-JS/reduced-
 *      motion fallback. Run that script again after this one.
 *
 * No transcoding: this repo has no ffmpeg build with mp4/h264 support (the
 * one bundled with Playwright, under ms-playwright/ffmpeg-*, is built
 * `--disable-everything` except mjpeg decode + vp9/webm encode, for trace
 * recording only — it cannot read or write .mp4). The source file is
 * already small (~2 MB) and web-ready (H.264 in an MP4 container), so it is
 * published unmodified. If a future source video needs trimming or
 * compression, install a full ffmpeg build first.
 *
 * Needs `@playwright/test` (devDependency) to decode the frame — a real
 * browser, not ffmpeg, extracts the poster via <video> + <canvas>.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "design-assets/video.mp4");
const VIDEO_OUT = path.join(ROOT, "public/videos/business-band.mp4");
const POSTER_OUT = path.join(ROOT, "design-assets/business-band-poster.jpg");
const POSTER_TIME_SECONDS = 2; // a stable moment early in the clip

fs.mkdirSync(path.dirname(VIDEO_OUT), { recursive: true });
fs.copyFileSync(SRC, VIDEO_OUT);
console.log("copied:", VIDEO_OUT);

const server = http.createServer((req, res) => {
  const stat = fs.statSync(SRC);
  res.writeHead(200, { "Content-Type": "video/mp4", "Content-Length": stat.size });
  fs.createReadStream(SRC).pipe(res);
});
await new Promise((resolve) => server.listen(0, resolve));
const { port } = server.address();

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://localhost:${port}/video.mp4`);
const dataUrl = await page.evaluate((t) => {
  return new Promise((resolve, reject) => {
    const v = document.querySelector("video");
    const onSeeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      canvas.getContext("2d").drawImage(v, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    v.addEventListener("seeked", onSeeked, { once: true });
    v.currentTime = t;
    setTimeout(() => reject(new Error("timed out extracting frame")), 10_000);
  });
}, POSTER_TIME_SECONDS);
await browser.close();
server.close();

fs.writeFileSync(POSTER_OUT, Buffer.from(dataUrl.split(",")[1], "base64"));
console.log("poster frame saved:", POSTER_OUT);
console.log("next: run `node scripts/process-images.mjs` to crop/publish the poster.");
