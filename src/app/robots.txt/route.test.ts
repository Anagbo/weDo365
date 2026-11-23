import { describe, expect, it } from "vitest";
import {
  NOINDEX,
  NON_PRODUCTION_HOST_PATTERN,
  isProductionHost,
} from "@/config/indexing";
import { SITE_URL } from "@/config/site";
import { GET } from "./route";

const INDEXABLE = ["wedo365.se", "www.wedo365.se", "WWW.WeDo365.se"];
const BLOCKED = [
  "localhost",
  "localhost:3000",
  "we-do365.netlify.app",
  "we-do365.vercel.app",
  "deploy-preview-3--we-do365.netlify.app",
  "wedo365.se.evil.example",
  "notwedo365.se",
  "",
];

const robotsFor = async (host: string) =>
  (
    await GET(new Request("http://internal/robots.txt", { headers: { host } }))
  ).text();

describe("robots.txt per Host header", () => {
  for (const host of INDEXABLE) {
    it(`allows crawling on ${host}`, async () => {
      expect(await robotsFor(host)).toBe(
        `User-Agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      );
    });
  }

  for (const host of BLOCKED.filter(Boolean)) {
    it(`disallows everything on ${host}`, async () => {
      expect(await robotsFor(host)).toBe("User-Agent: *\nDisallow: /\n");
    });
  }

  it("uses X-Forwarded-Host (first value) when a proxy sets it", async () => {
    const res = await GET(
      new Request("http://localhost:3000/robots.txt", {
        headers: {
          host: "localhost:3000",
          "x-forwarded-host": "www.wedo365.se, internal",
        },
      }),
    );
    expect(await res.text()).toContain("Allow: /");
  });

  it("does not depend on VERCEL_ENV or other platform variables", async () => {
    process.env.VERCEL_ENV = "preview";
    try {
      expect(await robotsFor("www.wedo365.se")).toContain("Allow: /");
    } finally {
      delete process.env.VERCEL_ENV;
    }
  });
});

describe("noindex header rule", () => {
  const blocksHost = (host: string) =>
    new RegExp(`^${NON_PRODUCTION_HOST_PATTERN}$`).test(host);

  it("is the documented value", () => {
    expect(NOINDEX).toBe("noindex, nofollow");
  });

  for (const host of INDEXABLE.map((h) => h.toLowerCase())) {
    it(`does not apply to ${host}`, () => {
      expect(blocksHost(host)).toBe(false);
      expect(isProductionHost(host)).toBe(true);
    });
  }

  for (const host of BLOCKED) {
    it(`applies to "${host}"`, () => {
      expect(blocksHost(host)).toBe(true);
      expect(isProductionHost(host)).toBe(false);
    });
  }
});

describe("canonical host", () => {
  it("is www (the live site redirects the apex to it)", () => {
    expect(SITE_URL).toBe("https://www.wedo365.se");
  });
});
