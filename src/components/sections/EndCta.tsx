import type { ComponentProps } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/button";

type Href = ComponentProps<typeof Link>["href"];

/** Closing call-to-action band on `tint`. */
export async function EndCta({
  title,
  text,
  cta,
  href,
  attached = false,
}: {
  title: string;
  text: string;
  cta: string;
  href: Href;
  /**
   * Set when this band sits directly after another `tint` section (no page
   * background should show between them) — drops the usual top margin.
   */
  attached?: boolean;
}) {
  const meta = await getTranslations("meta");
  const phone = meta("phone");

  // If the text mentions the phone number, make that part a tel: link.
  const [before, after] = text.includes(phone)
    ? text.split(phone)
    : [text, undefined];

  return (
    <section className={`bg-tint ${attached ? "mt-0" : "mt-12 md:mt-16"}`}>
      <div className="container-site flex flex-wrap items-center justify-between gap-6 py-14 md:py-18">
        <div className="flex flex-col gap-2">
          <h2 className="text-h2-sm md:text-[36px] md:leading-tight">
            {title}
          </h2>
          <p className="text-[17px] text-muted">
            {before}
            {after !== undefined ? (
              <>
                <a
                  href={meta("phoneHref")}
                  className="font-semibold whitespace-nowrap text-green underline underline-offset-4"
                >
                  {phone}
                </a>
                {after}
              </>
            ) : null}
          </p>
        </div>
        <Link href={href} className={buttonClasses("primary")}>
          {cta}
        </Link>
      </div>
    </section>
  );
}
