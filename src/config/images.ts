/**
 * Photos on the site. Every slot is empty until a real photo exists, and a
 * slot with no photo renders nothing at all (no box, no caption).
 *
 * To add one: put the file in `public/images/`, then fill in the slot, e.g.
 *   hero: { src: "/images/hero.jpg", width: 1200, height: 900 },
 * The alt text comes from the messages files (`home.heroPhotoAlt` etc.).
 */
export type SiteImage = { src: string; width: number; height: number };

export type ImageKey = "hero" | "businessBand" | "homeCleaning" | "business";

export const IMAGES: Record<ImageKey, SiteImage | null> = {
  hero: null,
  businessBand: null,
  homeCleaning: null,
  business: null,
};

export const hasImage = (key: ImageKey) => IMAGES[key] !== null;
