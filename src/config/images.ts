/**
 * Photos on the site. A slot with no photo renders nothing at all (no box,
 * no caption), and the page lays out without it.
 *
 * The files in `public/images/` are made from the originals in
 * `design-assets/` by `node scripts/process-images.mjs` (4:5 crop, 1200×1500,
 * no metadata, blur placeholder in `image-blur.ts`). To change a slot, add
 * the photo to that script, run it, then point the slot at the new file.
 * The alt text comes from the messages files (`home.heroPhotoAlt` etc.).
 *
 * `homeCleaning` is empty on purpose: the photos we have show a gym and
 * staff rooms at commercial premises, and /hemstadning is about private homes.
 */
import { BLUR } from "./image-blur";

export type SiteImage = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
  /** CSS object-position, to keep the subject in frame when cropped. */
  position?: string;
};

export type ImageKey =
  "hero" | "businessBand" | "homeCleaning" | "business" | "about";

function photo(name: string, position?: string): SiteImage {
  return {
    src: `/images/${name}.jpg`,
    width: 1200,
    height: 1500,
    blurDataURL: BLUR[name],
    position,
  };
}

export const IMAGES: Record<ImageKey, SiteImage | null> = {
  hero: photo("team-gym-floor-scrubber", "50% 35%"),
  businessBand: photo("team-mirror-orchid", "60% 40%"),
  homeCleaning: null,
  business: photo("team-gym-wetrok-mambo", "50% 40%"),
  about: photo("team-washroom-tap", "65% 40%"),
};

export const hasImage = (key: ImageKey) => IMAGES[key] !== null;

/** The logo is a small raster (439×260): show it at this size or smaller. */
export const LOGO = {
  src: "/images/wedo365-logo.jpg",
  width: 439,
  height: 262,
} as const;
