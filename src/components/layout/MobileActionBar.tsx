"use client";

import { Link, usePathname } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import { buttonClasses } from "@/components/ui/button";

/** Pages that already are the form: no bar there. */
const HIDDEN_ON: readonly AppPathname[] = ["/boka", "/offert"];

/**
 * Call and request buttons stuck to the bottom of small screens.
 *
 * It is the last element of <body> and `sticky`, not `fixed`: while the page
 * scrolls it stays on the screen, and at the very bottom it sits *below* the
 * footer in the normal flow, so it never covers the footer.
 */
export function MobileActionBar({
  call,
  cta,
}: {
  call: { label: string; aria: string; href: string };
  cta: string;
}) {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname as AppPathname)) return null;

  return (
    <div className="sticky bottom-0 z-40 flex gap-3 border-t border-line bg-ground px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <a
        href={call.href}
        aria-label={call.aria}
        className={buttonClasses("secondary", "flex-1 px-4")}
      >
        {call.label}
      </a>
      <Link href="/boka" className={buttonClasses("primary", "flex-[2] px-4")}>
        {cta}
      </Link>
    </div>
  );
}
