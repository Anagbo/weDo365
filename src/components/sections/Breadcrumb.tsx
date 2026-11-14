import type { ComponentProps } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export type Crumb = {
  label: string;
  /** Omit for a level without its own page; it is shown as plain text. */
  href?: ComponentProps<typeof Link>["href"];
};

/** Breadcrumb trail. The last item is the current page. */
export async function Breadcrumb({ items }: { items: Crumb[] }) {
  const ui = await getTranslations("ui");

  return (
    <nav aria-label={ui("breadcrumb")} className="container-site pt-3">
      <ol className="flex flex-wrap gap-2 text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-muted">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 min-w-11 items-center underline underline-offset-4 hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-muted">{item.label}</span>
              )}
              {last ? null : (
                <span aria-hidden="true" className="text-muted">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
