import { describe, expect, it } from "vitest";
import { MESSAGES } from "@/messages";
import {
  COMPANY,
  COMPANY_TOKENS,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  companyJsonLd,
  socialLinks,
} from "./company";

const ALL_TEXT = JSON.stringify(MESSAGES);

describe("company config", () => {
  it("has a VAT number built from the org.nr (SE + 10 digits + 01)", () => {
    expect(COMPANY.vatId).toBe(`SE${COMPANY.orgNr.replace("-", "")}01`);
  });

  it("has a tel: number that matches the displayed phone number", () => {
    const local = COMPANY.phone.display.replace(/\D/g, "");
    expect(COMPANY.phone.e164).toBe(`+46${local.slice(1)}`);
  });
});

describe("company details in the messages", () => {
  it("leaves no company token unfilled", () => {
    for (const token of Object.keys(COMPANY_TOKENS)) {
      expect(ALL_TEXT, token).not.toContain(`{${token}}`);
    }
  });

  it("has no filled-in placeholders left", () => {
    for (const old of [
      "[ORG.NR]",
      "[E-POST]",
      "[EMAIL]",
      "[FÖRSÄKRINGSBOLAG]",
      "[INSURER]",
      "Kollektivavtal",
      "Collective agreement",
    ]) {
      expect(ALL_TEXT, old).not.toContain(old);
    }
  });

  it("shows the real details in both languages", () => {
    for (const m of [MESSAGES.sv, MESSAGES.en]) {
      expect(m.footer.org).toContain(COMPANY.orgNr);
      expect(m.footer.email).toBe(COMPANY.email);
      expect(m.meta.phoneHref).toBe(`tel:${COMPANY.phone.e164}`);
      expect(m.footer.about).toContain(COMPANY.employees);
    }
    expect(MESSAGES.sv.home.trust[0]).toBe("Ansvarsförsäkring hos If");
    expect(MESSAGES.en.business.trust[0]).toBe("Liability insurance with If");
  });
});

describe("structured data", () => {
  const data = companyJsonLd("https://example.se");

  it("names the company with its legal ids and contact details", () => {
    expect(data).toMatchObject({
      legalName: "WeDo 365 AB",
      vatID: "SE559564802201",
      taxID: "559564-8022",
      telephone: "+46761780902",
      email: "info@wedo365.se",
      address: {
        "@type": "PostalAddress",
        streetAddress: "c/o Aikins Owusu, Storevretsvägen 19, LGH 1302",
        postalCode: "147 54",
        addressLocality: "Tumba",
        addressCountry: "SE",
      },
    });
  });

  it("lists the Instagram and Facebook pages in sameAs", () => {
    expect(data.sameAs).toEqual([
      "https://www.instagram.com/wedo365ab/",
      "https://www.facebook.com/profile.php?id=61595583265899",
    ]);
  });

  it("has no coordinates or opening hours", () => {
    expect(data).not.toHaveProperty("geo");
    expect(data).not.toHaveProperty("openingHours");
    expect(data).not.toHaveProperty("openingHoursSpecification");
  });
});

describe("social links", () => {
  it("are https links to the right services", () => {
    expect(new URL(INSTAGRAM_URL).hostname).toBe("www.instagram.com");
    expect(new URL(FACEBOOK_URL).hostname).toBe("www.facebook.com");
    expect(socialLinks().map((l) => l.id)).toEqual(["instagram", "facebook"]);
  });
});
