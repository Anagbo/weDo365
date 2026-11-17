import Image from "next/image";
import {
  IMAGES,
  type ImageKey,
  type SiteImage as Source,
} from "@/config/images";

/**
 * A photo from `src/config/images.ts`. Renders nothing while that slot is
 * empty. Callers that lay out around the photo should check `hasImage(key)`.
 * Photos load lazily; pass `preload` only for the one at the top of the page.
 */
export function SiteImage({
  name,
  alt,
  className = "",
  preload = false,
}: {
  name: ImageKey;
  alt: string;
  /** Height classes, e.g. "h-[280px] lg:h-[440px]". */
  className?: string;
  preload?: boolean;
}) {
  const image: Source | null = IMAGES[name];
  if (!image) return null;
  return (
    <div className={`relative overflow-hidden rounded-photo ${className}`}>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={alt}
        preload={preload}
        placeholder="blur"
        blurDataURL={image.blurDataURL}
        quality={80}
        sizes="(min-width: 1024px) 560px, 100vw"
        style={{ objectPosition: image.position }}
        className="size-full object-cover"
      />
    </div>
  );
}
