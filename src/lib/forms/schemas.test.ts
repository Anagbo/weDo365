import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { ZodType } from "zod";
import { NOW, rawBusiness, rawHome } from "@/test/fixtures";
import {
  businessRequestSchema,
  fieldErrors,
  homeContactStep,
  homeDetailsStep,
  homeRequestSchema,
  homeTimePlaceStep,
  looksLikeSpam,
  MIN_FILL_MS,
  requestSchema,
  spamGuardSchema,
} from "./schemas";

beforeAll(() => {
  // Only Date is faked: "today" in the date rules is 14 Nov 2026.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});
afterAll(() => vi.useRealTimers());

/** First error key per field, or {} when the input is valid. */
function errorsOf(schema: ZodType, input: unknown) {
  const result = schema.safeParse(input);
  return result.success ? {} : fieldErrors(result.error);
}

describe("home request", () => {
  it("accepts a valid home cleaning request and converts the number fields", () => {
    const parsed = homeRequestSchema.parse(rawHome);
    expect(parsed).toMatchObject({
      kind: "home",
      service: "hem",
      size: 72,
      frequency: "biweekly",
      phone: "0701234567",
    });
  });

  it.each(["unsure", "once", "weekly", "every4weeks"] as const)(
    "accepts the frequency %s",
    (frequency) => {
      expect(
        homeRequestSchema.parse({ ...rawHome, frequency }),
      ).toMatchObject({ frequency });
    },
  );

  it.each([
    ["w1", "weekly"],
    ["w2", "biweekly"],
    ["w4", "every4weeks"],
  ] as const)(
    "accepts the older frequency id %s as %s, for links or data saved before 'unsure' was added",
    (legacy, current) => {
      expect(
        homeRequestSchema.parse({ ...rawHome, frequency: legacy }),
      ).toMatchObject({ frequency: current });
    },
  );

  it.each(["flytt", "stor"] as const)(
    "accepts %s with a size and no frequency",
    (service) => {
      const { frequency: _omit, ...rest } = rawHome;
      void _omit;
      const parsed = homeRequestSchema.parse({ ...rest, service });
      expect(parsed).toMatchObject({ service, size: 72 });
    },
  );

  it("accepts window cleaning with a number of windows instead of a size", () => {
    const { size: _s, frequency: _f, ...rest } = rawHome;
    void _s;
    void _f;
    const parsed = homeRequestSchema.parse({
      ...rest,
      service: "fonster",
      windows: "12",
    });
    expect(parsed).toMatchObject({ service: "fonster", windows: 12 });
  });

  it("treats notes as optional", () => {
    const { notes: _n, ...rest } = rawHome;
    void _n;
    expect(homeRequestSchema.parse(rest)).toMatchObject({ notes: "" });
  });

  it("requires a frequency for home cleaning, but not for the other services", () => {
    const { frequency: _f, ...rest } = rawHome;
    void _f;
    expect(errorsOf(homeDetailsStep, rest)).toEqual({ frequency: "choose" });
    expect(errorsOf(homeDetailsStep, { ...rest, service: "flytt" })).toEqual(
      {},
    );
  });

  it("requires windows (not size) for window cleaning", () => {
    expect(
      errorsOf(homeDetailsStep, { service: "fonster", size: "60" }),
    ).toEqual({ windows: "required" });
  });

  it.each([
    ["too small", "9"],
    ["too large", "501"],
    ["not a whole number", "60.5"],
    ["empty", ""],
  ])("rejects a size that is %s", (_why, size) => {
    const errors = errorsOf(homeDetailsStep, { ...rawHome, size });
    expect(Object.keys(errors)).toEqual(["size"]);
  });

  it("collapses line breaks and extra spaces in single-line fields", () => {
    const parsed = homeRequestSchema.parse({
      ...rawHome,
      name: "  Anna \r\n  Bcc: x@evil.test ",
      city: "Solna\n",
    });
    expect(parsed.name).toBe("Anna Bcc: x@evil.test");
    expect(parsed.city).toBe("Solna");
  });

  describe("time and place", () => {
    const base = {
      date: "2026-12-04",
      slot: "pm",
      street: "Storgatan 1",
      zip: "12345",
      city: "Solna",
    };

    it("accepts today and later dates", () => {
      expect(
        errorsOf(homeTimePlaceStep, { ...base, date: "2026-11-14" }),
      ).toEqual({});
      expect(
        errorsOf(homeTimePlaceStep, { ...base, date: "2027-01-01" }),
      ).toEqual({});
    });

    it("rejects yesterday", () => {
      expect(
        errorsOf(homeTimePlaceStep, { ...base, date: "2026-11-13" }),
      ).toEqual({
        date: "datePast",
      });
    });

    it("uses Stockholm time for 'today' (23:30 UTC is already the next day there)", () => {
      vi.setSystemTime(new Date("2026-11-14T23:30:00Z"));
      try {
        expect(
          errorsOf(homeTimePlaceStep, { ...base, date: "2026-11-14" }),
        ).toEqual({
          date: "datePast",
        });
        expect(
          errorsOf(homeTimePlaceStep, { ...base, date: "2026-11-15" }),
        ).toEqual({});
      } finally {
        vi.setSystemTime(NOW);
      }
    });

    it.each(["", "tomorrow", "2026-13-45x"])("rejects the date %j", (date) => {
      expect(
        Object.keys(errorsOf(homeTimePlaceStep, { ...base, date })),
      ).toEqual(["date"]);
    });

    it.each(["12345", "123 45"])("accepts the postcode %j", (zip) => {
      expect(errorsOf(homeTimePlaceStep, { ...base, zip })).toEqual({});
    });

    it.each(["1234", "123456", "12 345", "abcde"])(
      "rejects the postcode %j",
      (zip) => {
        expect(errorsOf(homeTimePlaceStep, { ...base, zip })).toEqual({
          zip: "zip",
        });
      },
    );

    it("requires a time slot, street and city", () => {
      expect(
        errorsOf(homeTimePlaceStep, {
          ...base,
          slot: "",
          street: "",
          city: " ",
        }),
      ).toEqual({ slot: "choose", street: "required", city: "required" });
    });

    it("rejects notes that are too long", () => {
      expect(
        errorsOf(homeTimePlaceStep, { ...base, notes: "x".repeat(1001) }),
      ).toEqual({ notes: "tooLong" });
    });
  });

  describe("contact", () => {
    const base = {
      name: "Anna",
      email: "anna@example.se",
      phone: "0701234567",
    };

    it.each(["070-123 45 67", "+46 70 123 45 67", "(08) 123 456 78"])(
      "accepts the phone number %j",
      (phone) => {
        expect(errorsOf(homeContactStep, { ...base, phone })).toEqual({});
      },
    );

    it.each(["12345", "call me", "070123456789012345"])(
      "rejects the phone number %j",
      (phone) => {
        expect(errorsOf(homeContactStep, { ...base, phone })).toEqual({
          phone: "phone",
        });
      },
    );

    it.each(["anna", "anna@", "anna@example", "a b@example.se"])(
      "rejects the email %j",
      (email) => {
        expect(errorsOf(homeContactStep, { ...base, email })).toEqual({
          email: "email",
        });
      },
    );

    it("requires every contact field", () => {
      expect(
        errorsOf(homeContactStep, { name: "", email: "", phone: "" }),
      ).toEqual({
        name: "required",
        email: "required",
        phone: "required",
      });
    });
  });
});

describe("business request", () => {
  it("accepts a valid request and normalises the phone number", () => {
    const parsed = businessRequestSchema.parse(rawBusiness);
    expect(parsed).toMatchObject({
      kind: "business",
      premises: "gym",
      area: 400,
      frequency: "weekly",
      company: "Gym & Co AB",
      phone: "+46761780902",
    });
  });

  it("treats the message as optional", () => {
    const { message: _m, ...rest } = rawBusiness;
    void _m;
    expect(businessRequestSchema.parse(rest)).toMatchObject({ message: "" });
  });

  it("does not know about an org.nr (it must never be collected)", () => {
    const parsed = businessRequestSchema.parse({
      ...rawBusiness,
      orgNr: "556677-8899",
    });
    expect(parsed).not.toHaveProperty("orgNr");
  });

  it("requires the type of premises and frequency to be chosen", () => {
    expect(
      errorsOf(businessRequestSchema, {
        ...rawBusiness,
        premises: "",
        frequency: "",
      }),
    ).toEqual({ premises: "choose", frequency: "choose" });
  });

  it("rejects values that are not in the lists", () => {
    expect(
      errorsOf(businessRequestSchema, {
        ...rawBusiness,
        premises: "castle",
        frequency: "hourly",
      }),
    ).toEqual({ premises: "choose", frequency: "choose" });
  });

  it.each(["0", "100001", "12.5", ""])("rejects the area %j", (area) => {
    expect(
      Object.keys(errorsOf(businessRequestSchema, { ...rawBusiness, area })),
    ).toEqual(["area"]);
  });

  it("requires company, contact person, email and phone", () => {
    expect(
      errorsOf(businessRequestSchema, {
        ...rawBusiness,
        company: "",
        contactName: "",
        email: "nope",
        phone: "",
      }),
    ).toEqual({
      company: "required",
      contactName: "required",
      email: "email",
      phone: "required",
    });
  });
});

describe("requestSchema (what /api/request accepts)", () => {
  it("accepts both kinds", () => {
    expect(requestSchema.safeParse(rawHome).success).toBe(true);
    expect(requestSchema.safeParse(rawBusiness).success).toBe(true);
  });

  it("rejects an unknown kind, an unknown language and non-objects", () => {
    expect(requestSchema.safeParse({ ...rawHome, kind: "other" }).success).toBe(
      false,
    );
    expect(requestSchema.safeParse({ ...rawHome, locale: "de" }).success).toBe(
      false,
    );
    expect(requestSchema.safeParse(null).success).toBe(false);
    expect(requestSchema.safeParse("hello").success).toBe(false);
  });

  it("does not let a business payload pass as a home request", () => {
    expect(
      requestSchema.safeParse({ ...rawBusiness, kind: "home" }).success,
    ).toBe(false);
  });

  it("accepts the English language code", () => {
    expect(requestSchema.safeParse({ ...rawHome, locale: "en" }).success).toBe(
      true,
    );
  });
});

describe("spam guard", () => {
  const guard = (input: unknown) => spamGuardSchema.parse(input);

  it("lets a normal submission through", () => {
    expect(looksLikeSpam(guard({ website: "", fillMs: 8000 }))).toBe(false);
  });

  it("flags a filled-in honeypot", () => {
    expect(
      looksLikeSpam(guard({ website: "http://spam.test", fillMs: 8000 })),
    ).toBe(true);
  });

  it("flags a submission that came too fast, with the limit being exclusive", () => {
    expect(looksLikeSpam(guard({ website: "", fillMs: MIN_FILL_MS - 1 }))).toBe(
      true,
    );
    expect(looksLikeSpam(guard({ website: "", fillMs: MIN_FILL_MS }))).toBe(
      false,
    );
  });

  it("treats a missing honeypot as empty, but requires the timer", () => {
    expect(looksLikeSpam(guard({ fillMs: 8000 }))).toBe(false);
    expect(spamGuardSchema.safeParse({ website: "" }).success).toBe(false);
    expect(spamGuardSchema.safeParse({ website: "", fillMs: -1 }).success).toBe(
      false,
    );
  });
});
