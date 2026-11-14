import { describe, expect, it } from "vitest";
import { SERVICE_IDS } from "@/config/site";
import {
  FREQUENCY_IDS,
  PREMISES_IDS,
  QUOTE_FREQUENCY_IDS,
  SLOT_IDS,
} from "@/lib/forms/constants";
import en from "./en.json";
import sv from "./sv.json";

/**
 * The text of the site is edited by hand in these two files. These tests
 * catch the mistakes that are easy to make there: a key added to one
 * language only, an empty string, or a list that no longer lines up with the
 * form ids it is matched to by position.
 */

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/** Every leaf as "path.to[0].leaf" → string value. */
function leaves(value: Json, path = ""): Record<string, string> {
  if (Array.isArray(value)) {
    return value.reduce<Record<string, string>>(
      (all, item, i) => ({ ...all, ...leaves(item, `${path}[${i}]`) }),
      {},
    );
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).reduce<Record<string, string>>(
      (all, [key, item]) => ({
        ...all,
        ...leaves(item, path ? `${path}.${key}` : key),
      }),
      {},
    );
  }
  return { [path]: String(value) };
}

const svLeaves = leaves(sv as Json);
const enLeaves = leaves(en as Json);

describe("messages files", () => {
  it("have exactly the same keys in Swedish and English", () => {
    expect(Object.keys(enLeaves).sort()).toEqual(Object.keys(svLeaves).sort());
  });

  it("have no empty text", () => {
    for (const [name, all] of [
      ["sv", svLeaves],
      ["en", enLeaves],
    ] as const) {
      const empty = Object.entries(all)
        .filter(([, text]) => text.trim() === "")
        .map(([path]) => path);
      expect(empty, `empty text in ${name}.json`).toEqual([]);
    }
  });

  it("use the same {placeholders} in both languages", () => {
    const placeholders = (text: string) =>
      (text.match(/\{\w+\}/g) ?? []).sort().join(",");
    for (const path of Object.keys(svLeaves)) {
      expect(placeholders(enLeaves[path]), path).toBe(
        placeholders(svLeaves[path]),
      );
    }
  });

  it("keep the same square-bracket placeholders (owner fill-ins) in the same places", () => {
    const brackets = (text: string) => (text.match(/\[[^\]]+\]/g) ?? []).length;
    for (const path of Object.keys(svLeaves)) {
      // Names of places differ per language ("[Förnamn]" / "[First name]"),
      // so only the count is compared.
      expect(brackets(enLeaves[path]), path).toBe(brackets(svLeaves[path]));
    }
  });
});

describe("lists that are matched to form ids by position", () => {
  for (const [lang, messages] of [
    ["sv", sv],
    ["en", en],
  ] as const) {
    describe(lang, () => {
      it("book.services lines up with the service ids", () => {
        expect(messages.book.services.map((s) => s.id)).toEqual([
          ...SERVICE_IDS,
        ]);
      });

      it("home.services (service cards) has one card per service", () => {
        expect(messages.home.services).toHaveLength(SERVICE_IDS.length);
      });

      it("book.freqs lines up with the frequency ids", () => {
        expect(messages.book.freqs.map((f) => f.id)).toEqual([
          ...FREQUENCY_IDS,
        ]);
      });

      it("book.slots lines up with the time slot ids", () => {
        expect(messages.book.slots.map((s) => s.id)).toEqual([...SLOT_IDS]);
      });

      it("quote.types lines up with the premises ids", () => {
        expect(messages.quote.types).toHaveLength(PREMISES_IDS.length);
      });

      it("quote.freqs lines up with the business frequency ids", () => {
        expect(messages.quote.freqs).toHaveLength(QUOTE_FREQUENCY_IDS.length);
      });

      it("footer.serviceLinks has one link per service plus 'business'", () => {
        expect(messages.footer.serviceLinks).toHaveLength(
          SERVICE_IDS.length + 1,
        );
      });
    });
  }
});

describe("every form error has a message", () => {
  it("covers the error keys the schemas can produce", () => {
    // Keep in sync with ErrorKey in src/lib/forms/schemas.ts.
    const keys = [
      "required",
      "choose",
      "email",
      "phone",
      "range",
      "zip",
      "date",
      "datePast",
      "tooLong",
    ];
    for (const key of keys) {
      expect(sv.errors, key).toHaveProperty(key);
      expect(en.errors, key).toHaveProperty(key);
    }
  });
});

describe("the hard rules for the copy", () => {
  it("contains no prices, RUT or personal ID numbers", () => {
    const forbidden = /\bRUT\b|personnummer|personal identity|\d\s?(kr|SEK)\b/i;
    for (const all of [svLeaves, enLeaves]) {
      for (const [path, text] of Object.entries(all)) {
        expect(text, path).not.toMatch(forbidden);
      }
    }
  });
});
