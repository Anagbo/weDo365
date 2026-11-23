import { getImageProps } from "next/image";
import { TEAM_PHOTO } from "@/config/images";

/**
 * The team photo at the very top of the home page. A <picture> with one crop
 * per width (see TEAM_PHOTO), each shown in a box of its own aspect ratio, so
 * the space is reserved before the image loads and all six faces always fit.
 * It is the largest content on the page, so it is fetched with high priority.
 * The blur placeholders are CSS backgrounds, one per crop. The band is always
 * the full width of the page container, so it lines up with the header and
 * the hero. Only on short screens (under 860px tall, from md) is it narrower,
 * left-aligned and sized by --band-h (never under 184px), so the headline stays
 * above the fold on small laptops. The caption sits in the gap below, which is
 * the hero's own top padding.
 */
export function TeamBand({ alt, caption }: { alt: string; caption: string }) {
  const { landscape, tablet, phone } = TEAM_PHOTO;
  const common = {
    alt,
    quality: 80,
    sizes: "(min-width: 1200px) 1152px, calc(100vw - 48px)",
  };
  const srcSetOf = (crop: typeof phone) =>
    getImageProps({
      ...common,
      src: crop.src,
      width: crop.width,
      height: crop.height,
    }).props.srcSet;
  const { props } = getImageProps({
    ...common,
    src: phone.src,
    width: phone.width,
    height: phone.height,
  });
  const { srcSet: phoneSrcSet, ...img } = props;

  return (
    <section data-testid="team-band" className="container-site pt-12 md:pt-14">
      <figure
        style={
          {
            "--band-h": "clamp(184px, calc(100svh - 600px), 329px)",
          } as React.CSSProperties
        }
        className="relative md:[@media(max-height:859px)]:w-[min(100%,calc(var(--band-h)*2040/583))]"
      >
        <div
          style={
            {
              "--blur-phone": `url("${phone.blurDataURL}")`,
              "--blur-tablet": `url("${tablet.blurDataURL}")`,
              "--blur-landscape": `url("${landscape.blurDataURL}")`,
            } as React.CSSProperties
          }
          className="aspect-[2040/1530] overflow-hidden rounded-photo bg-(image:--blur-phone) bg-cover min-[480px]:aspect-[2040/850] min-[480px]:bg-(image:--blur-tablet) md:aspect-[2040/583] md:bg-(image:--blur-landscape)"
        >
          <picture>
            <source
              media={`(min-width: ${landscape.from}px)`}
              srcSet={srcSetOf(landscape)}
              sizes={common.sizes}
            />
            <source
              media={`(min-width: ${tablet.from}px)`}
              srcSet={srcSetOf(tablet)}
              sizes={common.sizes}
            />
            <source srcSet={phoneSrcSet} sizes={common.sizes} />
            <img
              {...img}
              alt={alt}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              style={{ objectPosition: landscape.position }}
              className="block size-full object-cover"
            />
          </picture>
        </div>
        <figcaption className="absolute top-full left-0 mt-2 text-sm text-muted">
          {caption}
        </figcaption>
      </figure>
    </section>
  );
}
