"use client";

import { getPathname, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type Props = {
  /** The language this link switches to. */
  target: Locale;
  /** Visible text, e.g. "EN". */
  label: string;
  /** Accessible name, written in the target language. */
  ariaLabel: string;
  /** Link to the other language's home page (for the 404 page, which has no matching page). */
  toHome?: boolean;
};

/** Links to the same page in the other language. */
export function LanguageSwitch({ target, label, ariaLabel, toHome }: Props) {
  const pathname = usePathname();
  // A plain <a>: changing language swaps the root layout (full page load)
  // anyway, and this gives the final URL ("/hemstadning", not
  // "/sv/hemstadning"), so there is no extra redirect.
  const href = getPathname({ href: toHome ? "/" : pathname, locale: target });

  return (
    <a
      href={href}
      lang={target}
      hrefLang={target}
      aria-label={ariaLabel}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-[1.5px] border-line bg-white px-3 text-sm font-semibold text-ink no-underline hover:border-ink"
    >
      {label}
    </a>
  );
}
