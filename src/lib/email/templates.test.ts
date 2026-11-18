import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { NOW, parseRequest, rawBusiness, rawHome } from "@/test/fixtures";
import {
  buildCustomerEmail,
  buildOwnerEmail,
  formatReceived,
} from "./templates";
import { escapeHtml } from "./text";

beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});
afterAll(() => vi.useRealTimers());

const RECEIVED = new Date("2026-11-14T20:05:00Z"); // 21:05 in Stockholm
const HOST = "wedo365.se";

/** Asserts that every value appears in both the HTML and the text version. */
function expectAll(email: { html: string; text: string }, values: string[]) {
  for (const value of values) {
    expect(email.text, `text should contain ${value}`).toContain(value);
    expect(email.html, `html should contain ${value}`).toContain(
      escapeHtml(value),
    );
  }
}

/**
 * Asserts a label/value row: in the text version as "Label: value" (no colon
 * after a question mark), and in the HTML as two separate table cells.
 */
function expectRows(
  email: { html: string; text: string },
  rows: [label: string, value: string][],
) {
  for (const [label, value] of rows) {
    const sep = label.endsWith("?") ? " " : ": ";
    expect(email.text, `text should contain ${label}${sep}${value}`).toContain(
      `${label}${sep}${value}`,
    );
    expect(email.html).toContain(`>${escapeHtml(label)}</td>`);
    expect(email.html).toContain(`>${escapeHtml(value)}</td>`);
  }
}

/** The words that must never appear: prices, RUT, personal ID numbers. */
const FORBIDDEN = /\bRUT\b|personnummer|personal identity|\d\s?(kr|SEK)\b/i;

/* ------------------------------------------------------------------ */

describe("owner email", () => {
  describe("home request", () => {
    const req = parseRequest(rawHome);
    const email = buildOwnerEmail(req, RECEIVED);

    it("has the subject 'Ny förfrågan: <service> – <name>'", () => {
      expect(email.subject).toBe("Ny förfrågan: Hemstädning – Anna Andersson");
    });

    it("contains every field the customer entered", () => {
      expectAll(email, [
        "Hemstädning",
        "72 m²",
        "Varannan vecka",
        "fredag 4 december 2026",
        "Förmiddag 08–12",
        "Storgatan 1",
        "123 45",
        "Solna",
        "Portkod 1234",
        "Anna Andersson",
        "anna@example.se",
        "0701234567",
      ]);
    });

    it("also shows the language and the time received (Stockholm time)", () => {
      expectAll(email, ["Svenska", "14 november 2026"]);
      expect(email.text).toMatch(/21[:.]05/);
    });

    it("shows an empty optional field as a dash, so the owner sees the full form", () => {
      const { notes: _n, ...rest } = rawHome;
      void _n;
      const noNotes = buildOwnerEmail(parseRequest(rest), RECEIVED);
      expect(noNotes.text).toMatch(
        /Portkod och annat vi bör veta \(valfritt\): –/,
      );
    });

    it("is written in Swedish, as an HTML document with lang=sv", () => {
      expect(email.html).toContain('<html lang="sv">');
      expect(email.text).toContain("Ny förfrågan från webbplatsen");
      expect(email.text).toContain("Tjänst:");
    });

    it("has no price, RUT or personal ID number", () => {
      expect(email.html + email.text).not.toMatch(FORBIDDEN);
    });
  });

  describe("other home services", () => {
    it("shows size but no frequency for move-out cleaning", () => {
      const { frequency: _f, ...rest } = rawHome;
      void _f;
      const email = buildOwnerEmail(
        parseRequest({ ...rest, service: "flytt" }),
        RECEIVED,
      );
      expect(email.subject).toBe(
        "Ny förfrågan: Flyttstädning – Anna Andersson",
      );
      expect(email.text).toContain("72 m²");
      expect(email.text).not.toContain("Hur ofta?");
    });

    it("shows the number of windows instead of a size for window cleaning", () => {
      const { size: _s, frequency: _f, ...rest } = rawHome;
      void _s;
      void _f;
      const email = buildOwnerEmail(
        parseRequest({ ...rest, service: "fonster", windows: "12" }),
        RECEIVED,
      );
      expect(email.subject).toBe("Ny förfrågan: Fönsterputs – Anna Andersson");
      expect(email.text).toContain("Antal fönster: 12 st");
      expect(email.text).not.toContain("Bostadens storlek");
    });
  });

  describe("business request", () => {
    const req = parseRequest({ ...rawBusiness, locale: "en" });
    const email = buildOwnerEmail(req, RECEIVED);

    it("has the subject with the premises type and the company", () => {
      expect(email.subject).toBe("Ny förfrågan: Företag (Gym) – Gym & Co AB");
    });

    it("contains every field, in Swedish, even when the customer used English", () => {
      expectRows(email, [
        ["Typ av lokal", "Gym"],
        ["Ungefärlig yta (m²)", "400"],
        ["Hur ofta?", "Varje vecka"],
        ["Företag eller förening", "Gym & Co AB"],
        ["Kontaktperson", "Bo Ek"],
        ["E-post", "bo@example.se"],
        ["Telefon", "+46761780902"],
        ["Meddelande (valfritt)", "Vi vill ha städning varje vecka."],
        // ... and it records that the customer used the English site.
        ["Språk på webbplatsen", "Engelska"],
      ]);
    });

    it("has no org.nr field", () => {
      expect(email.text).not.toMatch(/org\.?\s?nr/i);
    });
  });

  describe("safety", () => {
    it("escapes HTML in every field", () => {
      const req = parseRequest({
        ...rawHome,
        street: '<img src=x onerror="alert(1)">',
        notes: "<script>alert(1)</script> & more",
        name: 'Anna <i>"A"</i>',
      });
      const { html } = buildOwnerEmail(req, RECEIVED);
      expect(html).not.toContain("<script>");
      expect(html).not.toContain("<img");
      expect(html).not.toContain("<i>");
      expect(html).toContain(
        "&lt;script&gt;alert(1)&lt;/script&gt; &amp; more",
      );
      expect(html).toContain("Anna &lt;i&gt;&quot;A&quot;&lt;/i&gt;");
    });

    it("never puts a line break in the subject, even if a name contains one", () => {
      // The schema already collapses line breaks; this checks the builder on its own.
      const req = {
        ...parseRequest(rawHome),
        name: "Anna\r\nBcc: x@evil.test",
      };
      expect(buildOwnerEmail(req, RECEIVED).subject).not.toMatch(/[\r\n]/);
    });
  });
});

describe("formatReceived", () => {
  it("uses Stockholm time in winter (UTC+1)", () => {
    expect(formatReceived(new Date("2026-11-14T20:05:00Z"))).toMatch(
      /21[:.]05/,
    );
  });

  it("uses Stockholm time in summer (UTC+2)", () => {
    expect(formatReceived(new Date("2026-07-01T10:00:00Z"))).toMatch(
      /12[:.]00/,
    );
  });

  it("writes the date in Swedish", () => {
    expect(formatReceived(new Date("2026-11-14T20:05:00Z"))).toContain(
      "14 november 2026",
    );
  });
});

/* ------------------------------------------------------------------ */

describe("customer email", () => {
  describe("Swedish customer, home request", () => {
    const email = buildCustomerEmail(parseRequest(rawHome), HOST);

    it("is in Swedish", () => {
      expect(email.subject).toBe("Vi har fått din förfrågan – WeDo365");
      expect(email.html).toContain('<html lang="sv">');
      expectAll(email, [
        "Tack! Vi har fått din förfrågan.",
        "Hej Anna Andersson!",
        "Det här skickade du",
        "Gatuadress",
        "Vänliga hälsningar,",
      ]);
      expect(email.text).not.toContain("Street address");
    });

    it("says we will contact them by phone or email about price and time", () => {
      expect(email.text).toContain(
        "kontaktar dig via telefon eller e-post med pris och förslag på tid",
      );
    });

    it("summarises what they sent", () => {
      expectAll(email, [
        "Hemstädning",
        "72 m²",
        "Varannan vecka",
        "fredag 4 december 2026",
        "Förmiddag 08–12",
        "Storgatan 1",
        "123 45",
        "Solna",
        "Portkod 1234",
        "Anna Andersson",
        "anna@example.se",
        "0701234567",
      ]);
    });

    it("includes the phone number, as a link in the HTML version", () => {
      expect(email.text).toContain("076-178 09 02");
      expect(email.html).toContain('href="tel:+46761780902"');
    });

    it("names the website it was sent from", () => {
      expect(email.text).toContain("wedo365.se");
    });
  });

  describe("English customer", () => {
    const home = buildCustomerEmail(
      parseRequest({ ...rawHome, locale: "en" }),
      HOST,
    );
    const business = buildCustomerEmail(
      parseRequest({ ...rawBusiness, locale: "en" }),
      HOST,
    );

    it("gets an English home email", () => {
      expect(home.subject).toBe("We have received your request – WeDo365");
      expect(home.html).toContain('<html lang="en">');
      expectAll(home, [
        "Thank you! We have received your request.",
        "Hi Anna Andersson,",
        "What you sent us",
        "Street address",
        "Home cleaning",
        "Every two weeks",
        "Morning 08–12",
        "Kind regards,",
      ]);
      expect(home.text).toMatch(/Friday,? 4 December 2026/);
      expect(home.text).not.toContain("Gatuadress");
      expect(home.text).not.toContain("Hemstädning");
    });

    it("gets an English business email", () => {
      expect(business.subject).toBe("We have received your request – WeDo365");
      expectAll(business, ["Hi Bo Ek,"]);
      expectRows(business, [
        ["Type of premises", "Gym"],
        ["Company or association", "Gym & Co AB"],
        ["Contact person", "Bo Ek"],
        ["Message (optional)", "Vi vill ha städning varje vecka."],
      ]);
      expect(business.text).not.toContain("Typ av lokal");
      expect(business.text).toContain("We contact you to book a visit");
    });
  });

  describe("business request, Swedish", () => {
    const email = buildCustomerEmail(parseRequest(rawBusiness), HOST);

    it("is in Swedish and summarises the request", () => {
      expectAll(email, ["Hej Bo Ek!"]);
      expectRows(email, [
        ["Typ av lokal", "Gym"],
        ["Ungefärlig yta (m²)", "400"],
        ["Hur ofta?", "Varje vecka"],
        ["Företag eller förening", "Gym & Co AB"],
        ["E-post", "bo@example.se"],
        ["Telefon", "+46761780902"],
      ]);
    });
  });

  describe("privacy and safety", () => {
    it("contains nothing the customer did not enter, and none of the owner-only fields", () => {
      const { notes: _n, ...rest } = rawHome;
      void _n;
      const email = buildCustomerEmail(parseRequest(rest), HOST);
      for (const ownerOnly of [
        "Mottagen",
        "Språk på webbplatsen",
        "Typ av förfrågan",
        "Svara på det här mejlet",
      ]) {
        expect(email.html + email.text).not.toContain(ownerOnly);
      }
      // An empty optional field is left out, not shown as a dash.
      expect(email.text).not.toContain("Portkod och annat");
    });

    it("escapes HTML in the customer's input", () => {
      const email = buildCustomerEmail(
        parseRequest({
          ...rawBusiness,
          message: "<script>alert(1)</script>",
          company: "A & B <b>AB</b>",
        }),
        HOST,
      );
      expect(email.html).not.toContain("<script>");
      expect(email.html).not.toContain("<b>");
      expect(email.html).toContain("A &amp; B &lt;b&gt;AB&lt;/b&gt;");
    });

    it("has no price, RUT or personal ID number, in either language", () => {
      for (const locale of ["sv", "en"] as const) {
        for (const raw of [rawHome, rawBusiness]) {
          const email = buildCustomerEmail(
            parseRequest({ ...raw, locale }),
            HOST,
          );
          expect(email.html + email.text).not.toMatch(FORBIDDEN);
        }
      }
    });
  });
});
