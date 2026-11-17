/*
 * npm run check:placeholders
 *
 * Looks for text that must not reach customers: "[" (a bracketed fill-in
 * note), "Foto:" / "Photo:" (photo captions) and "TODO".
 *
 *   1. Messages: src/messages/*.json. Some of these are written but not shown
 *      yet (reviews, FAQ answers still to come). Listed so nothing is forgotten.
 *   2. Rendered output: the HTML that `next build` wrote to .next/server/app.
 *      This is what visitors can see, so this is what can fail the check.
 *
 * Locally it only warns (exit 0). With LAUNCH_CHECK=1 it exits 1 when the
 * rendered pages contain any of them, or when there is no build to check.
 * Run `npm run build` first.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PATTERNS = [/\[/, /Foto:/, /Photo:/, /TODO/];
const launch = process.env.LAUNCH_CHECK === "1";

const hit = (text) => PATTERNS.some((p) => p.test(text));
const excerpt = (text) => {
  const m = PATTERNS.map((p) => p.exec(text)).find(Boolean);
  const start = Math.max(0, m.index - 25);
  return text
    .slice(start, m.index + 45)
    .replace(/\s+/g, " ")
    .trim();
};

/* ---------- 1. messages ---------- */

function walk(value, trail, out) {
  if (typeof value === "string") {
    if (hit(value)) out.push([trail, excerpt(value)]);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, `${trail}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      walk(v, trail ? `${trail}.${k}` : k, out);
    }
  }
}

const inMessages = [];
for (const lang of ["sv", "en"]) {
  const json = JSON.parse(
    fs.readFileSync(path.join(ROOT, "src/messages", `${lang}.json`), "utf8"),
  );
  const found = [];
  walk(json, "", found);
  for (const [where, text] of found)
    inMessages.push([`${lang}: ${where}`, text]);
}

/* ---------- 2. rendered output ---------- */

const APP = path.join(ROOT, ".next/server/app");
const pages = [];
if (fs.existsSync(APP)) {
  const collect = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // "[locale]" holds templates, "sv"/"en" the real pages.
        if (!entry.name.startsWith("[")) collect(full);
      } else if (
        entry.name.endsWith(".html") &&
        !entry.name.startsWith("[") &&
        !entry.name.startsWith("_global-error")
      ) {
        pages.push(full);
      }
    }
  };
  collect(APP);
}

const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&");

const inRendered = [];
for (const file of pages) {
  const text = visibleText(fs.readFileSync(file, "utf8"));
  // Sentence-ish chunks keep the excerpts readable.
  for (const chunk of text.split(/\s{2,}/)) {
    if (hit(chunk)) {
      const name = path.relative(APP, file).split(path.sep).join("/");
      inRendered.push([name, excerpt(chunk)]);
    }
  }
}

/* ---------- report ---------- */

const list = (rows) =>
  rows.forEach(([a, b]) => console.log(`  ${a}\n      ${b}`));

console.log("\nPlaceholder check\n");
console.log(
  `Messages (${inMessages.length}): written text that may or may not be shown yet`,
);
list(inMessages);

console.log(`\nRendered pages (${inRendered.length}): what visitors can see`);
if (pages.length === 0) {
  console.log("  No build found. Run `npm run build` first.");
} else {
  console.log(`  (${pages.length} pages checked)`);
  list(inRendered);
}

const failed = launch && (inRendered.length > 0 || pages.length === 0);
if (failed) {
  console.error("\nLAUNCH_CHECK=1: the site is not ready to launch.\n");
  process.exit(1);
}
console.log(
  launch
    ? "\nLAUNCH_CHECK=1: no placeholders on the rendered pages.\n"
    : "\nWarning only. Set LAUNCH_CHECK=1 to make this fail.\n",
);
