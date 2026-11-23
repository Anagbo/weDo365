import { request } from "node:http";
import { expect, test } from "@playwright/test";

/**
 * Indexing per Host header, against the running site: robots.txt, the
 * X-Robots-Tag header and the robots meta tag. Production hosts are
 * indexable; everything else is blocked. node:http is used (not the browser
 * or fetch) because the Host header cannot be set in a page navigation.
 */

const BASE = "http://localhost:3000";
const CANONICAL = "https://www.wedo365.se";
const INDEXABLE = ["wedo365.se", "www.wedo365.se"];
const BLOCKED = ["localhost", "we-do365.netlify.app", "we-do365.vercel.app"];

type Reply = {
  headers: Record<string, string | string[] | undefined>;
  text: () => Promise<string>;
};

const get = (path: string, host: string) =>
  new Promise<Reply>((resolve, reject) => {
    const req = request(
      BASE + path,
      { headers: { host, "x-forwarded-host": host } },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            headers: res.headers,
            text: async () => Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );
    req.on("error", reject);
    req.end();
  });
for (const host of INDEXABLE) {
  test(`${host}: indexable`, async () => {
    const robots = await get("/robots.txt", host);
    expect(await robots.text()).toBe(
      `User-Agent: *\nAllow: /\n\nSitemap: ${CANONICAL}/sitemap.xml\n`,
    );
    for (const path of ["/", "/en", "/hemstadning", "/en/book"]) {
      const res = await get(path, host);
      expect(res.headers["x-robots-tag"], path).toBeUndefined();
      const html = await res.text();
      expect(html, path).not.toMatch(/<meta[^>]+name="robots"/);
    }
  });
}

for (const host of BLOCKED) {
  test(`${host}: blocked`, async () => {
    const robots = await get("/robots.txt", host);
    expect(await robots.text()).toBe("User-Agent: *\nDisallow: /\n");
    for (const path of ["/", "/en", "/hemstadning"]) {
      const res = await get(path, host);
      expect(res.headers["x-robots-tag"], path).toBe("noindex, nofollow");
    }
  });
}

test("sitemap and page metadata use the canonical host only", async () => {
  const xml = await (await get("/sitemap.xml", "www.wedo365.se")).text();
  const urls = [
    ...xml.matchAll(/<loc>([^<]+)</g),
    ...xml.matchAll(/href="([^"]+)"/g),
  ].map((m) => m[1]);
  expect(urls.length).toBeGreaterThan(0);
  for (const url of urls) expect(url.startsWith(`${CANONICAL}/`)).toBe(true);

  const html = await (await get("/en", "www.wedo365.se")).text();
  const links = [
    ...html.matchAll(/(?:canonical|alternate)"[^>]*href="(https?:[^"]+)"/g),
    ...html.matchAll(/property="og:url" content="([^"]+)"/g),
  ].map((m) => m[1]);
  expect(links.length).toBeGreaterThan(0);
  for (const url of links) expect(url.startsWith(CANONICAL)).toBe(true);
});
