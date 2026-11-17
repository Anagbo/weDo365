/**
 * Photos on the site. A slot with no photo renders nothing at all (no box,
 * no caption), and the page lays out without it.
 *
 * The files in `public/images/` are made from the originals in
 * `design-assets/` by `node scripts/process-images.mjs` (4:5 crop, 1200×1500,
 * no metadata, blur placeholder in `image-blur.ts`). To change a slot, add
 * the photo to that script, run it, then point the slot at the new file.
 * The alt text comes from the messages files (`slider.alts`, `home.businessPhotoAlt` etc.).
 *
 * `homeCleaning` is the staff-kitchen photo (microwave): the closest we have
 * to a home, but NOT a private home. Swap it for a photo from a real home job
 * when there is one.
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

export type ImageKey = "businessBand" | "homeCleaning" | "business" | "about";

function photo(name: string, position?: string): SiteImage {
  return {
    src: `/images/${name}.jpg`,
    width: 1200,
    height: 1500,
    blurDataURL: BLUR[name],
    position,
  };
}

function slide(name: string, position: string): SiteImage {
  return {
    src: `/images/${name}.jpg`,
    width: 1200,
    height: 900,
    blurDataURL: BLUR[name],
    position,
  };
}

export const IMAGES: Record<ImageKey, SiteImage | null> = {
  businessBand: photo("team-mirror-orchid", "60% 40%"),
  homeCleaning: slide("slide-microwave", "50% 60%"),
  business: photo("team-gym-wetrok-mambo", "50% 40%"),
  about: photo("team-washroom-tap", "65% 40%"),
};

/**
 * The hero slider on the home page: 4:3 photos (1200×900) shown at 4:3 on
 * mobile and 16:10 from `lg`. `position` keeps the person and the logo on the
 * shirt in frame when the 16:10 crop trims the top and bottom. The alt texts
 * are `slider.alts` in the messages files, in the same order. No client names,
 * phone numbers or readable text may be visible in any crop.
 */
export const HERO_SLIDES: readonly SiteImage[] = [
  slide("slide-shower", "50% 40%"),
  slide("slide-gym-floor-scrubber", "50% 35%"),
  slide("slide-mirror-orchid", "50% 75%"),
  slide("slide-microwave", "50% 60%"),
];

export const hasImage = (key: ImageKey) => IMAGES[key] !== null;

/**
 * The emblem, transparent PNG (338×140), shown at most 116×48 so it is always
 * at least 2x. There is no vector original yet (owner to supply one); both
 * files are transparent, so they sit directly on the page background.
 * `white` is the monochrome version for the dark footer, made from the
 * colour one by scripts/make-emblem-white.mjs.
 */
export const EMBLEM = {
  color: {
    src: "/images/wedo365-emblem.png",
    width: 338,
    height: 140,
  },
  white: {
    src: "/images/wedo365-emblem-white.png",
    width: 338,
    height: 140,
  },
} as const;
