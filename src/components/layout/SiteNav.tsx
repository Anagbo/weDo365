"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import { buttonClasses } from "@/components/ui/button";

export type NavItem = {
  label: string;
  href: AppPathname | { pathname: AppPathname; hash: string };
};

export type SocialItem = {
  id: "instagram" | "facebook";
  url: string;
  ariaLabel: string;
};

const SOCIAL_NAME = { instagram: "Instagram", facebook: "Facebook" } as const;

/** Plain inline glyphs in the ink colour; no external images or scripts. */
function SocialGlyph({ id }: { id: SocialItem["id"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {id === "instagram" ? (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5h.01" />
        </>
      ) : (
        <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" />
      )}
    </svg>
  );
}

type Props = {
  logo: ReactNode;
  languageSwitch: ReactNode;
  items: NavItem[];
  social: SocialItem[];
  navLabel: string;
  menuButtonLabel: string;
  call: { label: string; href: string };
  cta: string;
};

function isCurrent(item: NavItem, pathname: string) {
  // Section links (/#hur etc.) are never the "current page".
  return typeof item.href === "string" && item.href === pathname;
}

export function SiteNav({
  logo,
  languageSwitch,
  items,
  social,
  navLabel,
  menuButtonLabel,
  call,
  cta,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Close with Escape and return focus to the menu button.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  // Desktop: 2px green bar under the current page (as in the prototype).
  const desktopLinkClass = (current: boolean) =>
    `inline-flex min-h-11 items-center border-b-2 py-2.5 whitespace-nowrap text-ink no-underline hover:border-green ${
      current ? "border-green font-bold" : "border-transparent font-medium"
    }`;

  // Mobile menu rows: same idea, as an underline on the text.
  const mobileLinkClass = (current: boolean) =>
    `flex min-h-12 w-full items-center py-2 text-lg text-ink no-underline decoration-green decoration-2 underline-offset-8 hover:underline ${
      current ? "font-bold underline" : "font-medium"
    }`;

  return (
    <div className="container-site">
      <div className="flex min-h-19 items-center gap-4">
        {logo}

        <nav aria-label={navLabel} className="ml-4 hidden shrink-0 xl:block">
          <ul className="flex items-center gap-6">
            {items.map((item) => {
              const current = isCurrent(item, pathname);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={desktopLinkClass(current)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {social.length > 0 ? (
            <ul className="flex items-center max-[1099px]:hidden">
              {social.map((item) => (
                <li key={item.id}>
                  {/* 44px tap target around a 36px circle. */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.ariaLabel}
                    className="group inline-flex size-11 items-center justify-center rounded-full text-ink no-underline"
                  >
                    <span className="grid size-9 place-items-center rounded-full border-[1.5px] border-line bg-white group-hover:border-ink">
                      <SocialGlyph id={item.id} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {languageSwitch}
          <a
            href={call.href}
            className={buttonClasses("secondary", "max-[1535px]:hidden")}
          >
            {call.label}
          </a>
          <Link
            href="/boka"
            className={buttonClasses("primary", "max-md:hidden")}
          >
            {cta}
          </Link>
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-ink px-4 font-semibold text-ink xl:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
            {menuButtonLabel}
          </button>
        </div>
      </div>

      <div id={panelId} hidden={!open} className="pb-6 xl:hidden">
        <nav aria-label={navLabel}>
          <ul className="flex flex-col border-t border-line">
            {items.map((item) => {
              const current = isCurrent(item, pathname);
              return (
                <li key={item.label} className="border-b border-line">
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    onClick={close}
                    className={mobileLinkClass(current)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {social.length > 0 ? (
          <ul className="mt-2 flex flex-col border-b border-line min-[1100px]:hidden">
            {social.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.ariaLabel}
                  className="flex min-h-12 w-full items-center gap-3 py-2 text-lg font-medium text-ink no-underline decoration-green decoration-2 underline-offset-8 hover:underline"
                >
                  <SocialGlyph id={item.id} />
                  {SOCIAL_NAME[item.id]}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a href={call.href} className={buttonClasses("secondary")}>
            {call.label}
          </a>
          <Link
            href="/boka"
            onClick={close}
            className={buttonClasses("primary")}
          >
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
