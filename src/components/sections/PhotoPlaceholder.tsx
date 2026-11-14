/**
 * Neutral box standing in for a real photo. The caption comes from the
 * messages file (the `…PhotoAlt` keys). To add the photo later, put
 * `<Image fill alt={caption} className="object-cover" />` inside the figure
 * and drop the figcaption: the figure is already `relative` with a fixed size.
 */
export function PhotoPlaceholder({
  caption,
  className = "",
}: {
  caption: string;
  /** Height classes, e.g. "h-[280px] lg:h-[440px]". */
  className?: string;
}) {
  return (
    <figure
      className={`relative flex items-center justify-center overflow-hidden rounded-photo bg-tint p-6 text-center ${className}`}
    >
      <figcaption className="max-w-[280px] text-[15px] text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
