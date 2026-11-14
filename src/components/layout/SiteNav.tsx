"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import { buttonClasses } from "@/components/ui/button";

export type NavItem = {
  label: string;
  href: AppPathname | { pathname: AppPathname; hash: string };
};

type Props = {
  logo: ReactNode;
  languageSwitch: ReactNode;
  items: NavItem[];
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

  const linkClass = (current: boolean) =>
    `inline-flex min-h-11 items-center text-ink no-underline decoration-green decoration-2 underline-offset-8 hover:underline ${
      current ? "font-bold underline" : "font-medium"
    }`;

  return (
    <div className="container-site">
      <div className="flex min-h-19 items-center gap-4">
        {logo}

        <nav aria-label={navLabel} className="ml-4 hidden xl:block">
          <ul className="flex items-center gap-6">
            {items.map((item) => {
              const current = isCurrent(item, pathname);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={linkClass(current)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {languageSwitch}
          <a
            href={call.href}
            className={buttonClasses("secondary", "max-xl:hidden")}
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
                    className={`${linkClass(current)} w-full py-2 text-lg`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
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
