import Image from "next/image";
import {
  IMAGES,
  type ImageKey,
  type SiteImage as Source,
} from "@/config/images";

/**
 * A photo from `src/config/images.ts`. Renders nothing while that slot is
 * empty. Callers that lay out around the photo should check `hasImage(key)`.
 */
export function SiteImage({
  name,
  alt,
  className = "",
  priority = false,
}: {
  name: ImageKey;
  alt: string;
  /** Height classes, e.g. "h-[280px] lg:h-[440px]". */
  className?: string;
  priority?: boolean;
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
        priority={priority}
        sizes="(min-width: 1024px) 560px, 100vw"
        className="size-full object-cover"
      />
    </div>
  );
}
