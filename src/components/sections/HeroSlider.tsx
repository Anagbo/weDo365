"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";

export type Slide = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
  position?: string;
  alt: string;
};

export type SliderLabels = {
  region: string;
  /** "Bild {n} av {total}" with the numbers already filled in, per slide. */
  slides: string[];
  prev: string;
  next: string;
  /** "Visa bild {n}" per slide. */
  goTo: string[];
  pause: string;
  play: string;
  dots: string;
};

const INTERVAL_MS = 6000;
const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Server snapshot is "reduced", so no autoplay UI is rendered before hydration. */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED).matches,
    () => true,
  );
}

const arrow =
  "absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-white";

/**
 * Photo slider: CSS scroll-snap (swipe and trackpad are native scrolling),
 * previous/next buttons, dots and arrow keys. No autoplay unless `autoplay` is
 * set, and then never with prefers-reduced-motion. The frame reserves its
 * aspect ratio (4:3, 16:10 from lg), so nothing shifts while photos load.
 */
export function HeroSlider({
  slides,
  labels,
  autoplay = false,
}: {
  slides: Slide[];
  labels: SliderLabels;
  autoplay?: boolean;
}) {
  const track = useRef<HTMLUListElement>(null);
  const frame = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false); // hover, focus or touch
  const reduced = useReducedMotion();
  const canAutoplay = autoplay && !reduced && slides.length > 1;
  const running = canAutoplay && playing && !held;
  const count = slides.length;

  const goTo = useCallback(
    (index: number) => {
      const el = track.current;
      if (!el) return;
      const next = (index + count) % count;
      el.scrollTo({ left: next * el.clientWidth });
    },
    [count],
  );

  // The scroll position is the source of truth for the current slide.
  function onScroll() {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const el = track.current;
      if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
    });
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const el = track.current;
      if (!el) return;
      goTo(Math.round(el.scrollLeft / el.clientWidth) + 1);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [running, goTo]);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return; // leave the buttons alone
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    }
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.region}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      onTouchStart={() => setHeld(true)}
      onTouchEnd={() => setHeld(false)}
      onTouchCancel={() => setHeld(false)}
      className="flex flex-col gap-3 rounded-photo"
    >
      <div className="relative">
        <ul
          ref={track}
          onScroll={onScroll}
          aria-live={running ? "off" : "polite"}
          className="flex aspect-[4/3] snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain rounded-photo lg:aspect-[16/10] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => (
            <li
              key={slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={labels.slides[i]}
              className="relative size-full shrink-0 snap-center"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                // Only the first photo is preloaded (fetchpriority high); the
                // rest are lazy, with a blur placeholder.
                preload={i === 0}
                fetchPriority={i === 0 ? "high" : undefined}
                loading={i === 0 ? undefined : "lazy"}
                placeholder="blur"
                blurDataURL={slide.blurDataURL}
                quality={80}
                sizes="(min-width: 1024px) 560px, 100vw"
                style={{ objectPosition: slide.position }}
                className="object-cover"
              />
            </li>
          ))}
        </ul>
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label={labels.prev}
              onClick={() => goTo(active - 1)}
              className={`${arrow} left-3`}
            >
              <Chevron flip />
            </button>
            <button
              type="button"
              aria-label={labels.next}
              onClick={() => goTo(active + 1)}
              className={`${arrow} right-3`}
            >
              <Chevron />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex items-center justify-center gap-1">
          {canAutoplay && (
            <button
              type="button"
              aria-label={playing ? labels.pause : labels.play}
              onClick={() => setPlaying((p) => !p)}
              className="grid size-11 place-items-center rounded-full text-ink hover:bg-tint"
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          )}
          <div role="group" aria-label={labels.dots} className="flex">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                aria-label={labels.goTo[i]}
                aria-current={i === active ? "true" : undefined}
                onClick={() => goTo(i)}
                className="grid size-6 place-items-center rounded-full"
              >
                {/* A 24px hit area around a plain dot; the active one is bigger and green. */}
                <span
                  className={`block rounded-full transition-all ${
                    i === active ? "size-3.5 bg-green" : "size-2.5 bg-ink/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Chevron({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={flip ? "rotate-180" : undefined}
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
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
