import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HERO_SLIDES, TEAM_PHOTO } from "./images";
import en from "../messages/en.json";
import sv from "../messages/sv.json";

describe("team photo band", () => {
  it("has three crops that exist, are at least 2000px wide and have a blur", () => {
    for (const c of Object.values(TEAM_PHOTO)) {
      expect(c.width).toBeGreaterThanOrEqual(2000);
      expect(fs.existsSync(path.join("public", c.src))).toBe(true);
      expect(c.src).not.toMatch(/home-page/);
      expect(c.blurDataURL).toMatch(/^data:image\/jpeg;base64,/);
    }
  });

  it("has Swedish and English alt text and caption", () => {
    expect(sv.home.teamPhotoAlt).toContain("Sex medarbetare");
    expect(en.home.teamPhotoAlt).toContain("Six WeDo 365 AB team members");
    expect(sv.home.teamPhotoCaption).toBe("WeDo 365 AB-teamet i Stockholm");
    expect(en.home.teamPhotoCaption).toBe("The WeDo 365 AB team in Stockholm");
  });
});

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
