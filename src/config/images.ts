/**
 * Photos on the site. A slot with no photo renders nothing at all (no box,
 * no caption), and the page lays out without it.
 *
 * The files in `public/images/` are made from the originals in
 * `design-assets/` by `node scripts/process-images.mjs` (4:5 crop, 1200×1500,
 * no metadata, blur placeholder in `image-blur.ts`). To change a slot, add
 * the photo to that script, run it, then point the slot at the new file.
 * The alt text comes from the messages files (`slider.alts`, `home.businessVideoAlt` etc.).
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
  businessBand: photo("business-band-poster", "50% 35%"),
  homeCleaning: slide("slide-microwave", "50% 60%"),
  business: photo("team-gym-wetrok-mambo", "50% 40%"),
  about: photo("team-washroom-tap", "65% 40%"),
};

/**
 * The "business band" section on the home page shows a looping background
 * video instead of a static photo (see SiteVideo). `IMAGES.businessBand`
 * above is its poster frame: the first paint before the video loads, and
 * what's shown instead of the video when the visitor has
 * prefers-reduced-motion set. Both come from design-assets/video.mp4 via
 * scripts/process-video.mjs + scripts/process-images.mjs.
 */
export const BUSINESS_BAND_VIDEO = "/videos/business-band.mp4";

/**
 * The hero slider on the home page: 4:3 photos (1200×900) shown at 4:3 on
 * mobile and 16:10 from `lg`. `position` keeps the person and the logo on the
 * shirt in frame when the 16:10 crop trims the top and bottom. The alt texts
 * are `slider.alts` in the messages files, in the same order. No client names,
 * phone numbers or readable text may be visible in any crop.
 */
export const HERO_SLIDES: readonly SiteImage[] = [
  slide("slide-shower", "60% 40%"),
  slide("slide-oven", "45% 40%"),
  slide("slide-office-desk", "50% 55%"),
  slide("slide-floor-scrubber", "55% 45%"),
];

/**
 * The hero slider on the /foretag page: same 4:3/16:10 frame as the homepage
 * slider. The first slide reuses the existing `business` photo (4:5, but
 * `object-cover` crops it the same as the others); the rest are new 4:3
 * slides. The alt texts are `foretag.slider.alts` in the messages files, in
 * the same order.
 */
export const BUSINESS_SLIDES: readonly SiteImage[] = [
  photo("team-gym-wetrok-mambo", "50% 30%"),
  slide("slide-office-meeting", "45% 30%"),
  slide("slide-office-desk-2", "55% 35%"),
  slide("slide-office-vacuum", "50% 30%"),
  slide("slide-office-staircase", "40% 35%"),
];

export const hasImage = (key: ImageKey) => IMAGES[key] !== null;

/**
 * The team photo band at the very top of the home page (TeamBand): one photo
 * of the six team members, cropped three ways so that all six faces are fully
 * inside the frame at every width. The crops are made from
 * design-assets/home-page1.jpeg by scripts/process-team-photo.mjs (2040px
 * wide, no metadata). `from` is the min-width (px) where a crop takes over;
 * `position` is the focal point (the faces) for object-fit: cover. Alt text
 * and caption are `home.teamPhotoAlt` and `home.teamPhotoCaption`.
 */
export type TeamCrop = SiteImage & { from: number };

export const TEAM_PHOTO: Record<"landscape" | "tablet" | "phone", TeamCrop> = {
  // >= 768px: 3.5:1, about 206px tall at 768, 329px at the full 1152px.
  landscape: {
    src: "/images/team-wedo365-landscape.jpg",
    width: 2040,
    height: 583,
    blurDataURL: BLUR["team-wedo365-landscape"],
    position: "50% 45%",
    from: 768,
  },
  // 480-767px: 2.4:1.
  tablet: {
    src: "/images/team-wedo365-tablet.jpg",
    width: 2040,
    height: 850,
    blurDataURL: BLUR["team-wedo365-tablet"],
    position: "50% 45%",
    from: 480,
  },
  // < 480px: 4:3, the whole photo.
  phone: {
    src: "/images/team-wedo365-phone.jpg",
    width: 2040,
    height: 1530,
    blurDataURL: BLUR["team-wedo365-phone"],
    position: "50% 30%",
    from: 0,
  },
};

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
