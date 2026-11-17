import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HERO_SLIDES } from "./images";
import en from "../messages/en.json";
import sv from "../messages/sv.json";

describe("hero slides", () => {
  it("has 3-4 slides that all share one 4:3 shape", () => {
    expect(HERO_SLIDES.length).toBeGreaterThanOrEqual(3);
    expect(HERO_SLIDES.length).toBeLessThanOrEqual(4);
    for (const s of HERO_SLIDES) expect(s.width / s.height).toBeCloseTo(4 / 3);
  });

  it("points at files that exist and have a blur placeholder", () => {
    for (const s of HERO_SLIDES) {
      expect(fs.existsSync(path.join("public", s.src))).toBe(true);
      expect(s.blurDataURL).toMatch(/^data:image\/jpeg;base64,/);
    }
  });

  it("has Swedish and English alt text for every slide", () => {
    for (const messages of [sv, en]) {
      expect(messages.slider.alts).toHaveLength(HERO_SLIDES.length);
      for (const alt of messages.slider.alts)
        expect(alt.length).toBeGreaterThan(20);
    }
  });
});
