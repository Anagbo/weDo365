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
};

/** Links to the same page in the other language. */
export function LanguageSwitch({ target, label, ariaLabel }: Props) {
  const pathname = usePathname();
  // A plain <a>: changing language swaps the root layout (full page load)
  // anyway, and this gives the final URL ("/hemstadning", not
  // "/sv/hemstadning"), so there is no extra redirect.
  const href = getPathname({ href: pathname, locale: target });

  return (
    <a
      href={href}
      lang={target}
      hrefLang={target}
      aria-label={ariaLabel}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-white px-3 text-sm font-semibold text-ink no-underline hover:border-ink"
    >
      {label}
    </a>
  );
}
