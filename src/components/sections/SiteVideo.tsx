"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import type { SiteImage as Source } from "@/config/images";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Server snapshot is "reduced", so the video never autoplays before hydration. */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED).matches,
    () => true,
  );
}

/**
 * A looping, muted background video with a photo poster/fallback from
 * `src/config/images.ts`. Renders only the poster photo (no `<video>` at
 * all) when the visitor has prefers-reduced-motion set, or while the page
 * has not hydrated yet. Otherwise the video autoplays with a visible
 * pause/play control, since autoplaying motion content must stay operable
 * (WCAG 2.2.2). The video is always muted (no sound is ever played), so it
 * needs no captions.
 */
export function SiteVideo({
  src,
  poster,
  alt,
  pauseLabel,
  playLabel,
  className = "",
}: {
  src: string;
  poster: Source;
  alt: string;
  pauseLabel: string;
  playLabel: string;
  /** Height classes, e.g. "h-[280px] lg:h-[440px]". */
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(true);

  return (
    <div className={`relative overflow-hidden rounded-photo ${className}`}>
      <Image
        src={poster.src}
        width={poster.width}
        height={poster.height}
        alt={alt}
        placeholder="blur"
        blurDataURL={poster.blurDataURL}
        quality={80}
        sizes="(min-width: 1024px) 560px, 100vw"
        style={{ objectPosition: poster.position }}
        className="size-full object-cover"
      />
      {!reduced && (
        <>
          <video
            ref={(video) => {
              if (!video) return;
              if (playing) void video.play().catch(() => {});
              else video.pause();
            }}
            src={src}
            poster={poster.src}
            aria-label={alt}
            muted
            loop
            playsInline
            autoPlay
            style={{ objectPosition: poster.position }}
            className="absolute inset-0 size-full object-cover"
          />
          <button
            type="button"
            aria-label={playing ? pauseLabel : playLabel}
            onClick={() => setPlaying((p) => !p)}
            className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-white"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
        </>
      )}
    </div>
  );
}

function PauseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
    </svg>
  );
}
