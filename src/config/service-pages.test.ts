import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import { hasTodo, isTodo } from "@/lib/todo";
import en from "@/messages/en.json";
import sv from "@/messages/sv.json";
import { SERVICE_PAGES, SERVICE_PAGE_PATH } from "./service-pages";
import { SERVICE_IDS, SERVICE_SLUG, bookHref, serviceFromSlug } from "./site";

describe("service pages", () => {
  it("each has a route in both languages and a messages namespace", () => {
    for (const [key, page] of Object.entries(SERVICE_PAGES)) {
      expect(routing.pathnames[page.path], key).toHaveProperty("en");
      expect(sv, key).toHaveProperty(key);
      expect(en, key).toHaveProperty(key);
      expect(SERVICE_PAGE_PATH[page.service]).toBe(page.path);
    }
  });

  it("cover every wizard service", () => {
    expect(Object.values(SERVICE_PAGES).map((p) => p.service)).toEqual([
      ...SERVICE_IDS,
    ]);
  });
});

describe("wizard links", () => {
  it("use neutral words in English and read both languages back", () => {
    expect(bookHref("en", "flytt").query).toEqual({ service: "move" });
    expect(bookHref("sv", "flytt").query).toEqual({ tjanst: "flytt" });
    for (const locale of ["sv", "en"] as const) {
      for (const id of SERVICE_IDS) {
        expect(serviceFromSlug(SERVICE_SLUG[locale][id])).toBe(id);
        expect(serviceFromSlug(id)).toBe(id);
      }
    }
    expect(serviceFromSlug("nope")).toBeNull();
    expect(serviceFromSlug(null)).toBeNull();
  });
});

describe("TODO text", () => {
  it("is detected, also nested", () => {
    expect(isTodo("TODO: svar")).toBe(true);
    expect(isTodo("Todo list")).toBe(false);
    expect(hasTodo([{ a: "ok" }, { a: "TODO: x" }])).toBe(true);
    expect(hasTodo({ a: ["ok"] })).toBe(false);
  });
});
