/*
 * Runs before every build (npm "prebuild" hook). Fails the build when text
 * that is meant for the owner would reach customers:
 *   "[ÄGARE"       owner-decision placeholder (legal text)
 *   "[TEXT FRÅN"   text still to come from the company
 * Scans the messages files and the source code (tests excluded). Open owner
 * questions live in src/config/owner-todo.ts, never in rendered text.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MARKERS = ["[ÄGARE", "[TEXT FRÅN"];
const hits = [];

function scan(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  fs.readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      const marker = MARKERS.find((m) => line.includes(m));
      if (marker) hits.push(`${rel}:${i + 1}  ${marker}`);
    });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(json|tsx?)$/.test(entry.name) && !/\.test\./.test(entry.name))
      scan(full);
  }
}

walk(path.join(ROOT, "src"));

if (hits.length > 0) {
  console.error(
    "\nOwner placeholders found in production content:\n  " +
      hits.join("\n  ") +
      "\n\nRemove them and record the open question in src/config/owner-todo.ts.\n",
  );
  process.exit(1);
}
console.log("check-markers: no owner placeholders in production content.");
