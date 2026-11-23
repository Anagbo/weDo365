import type { Metadata } from "next";
import { getMessages, getTranslations } from "next-intl/server";
import type { AppPathname } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type LegalKey = "privacy" | "terms";

/** Which route each legal page lives at. */
const PATHS = {
  privacy: "/integritetspolicy",
  terms: "/villkor",
} as const satisfies Record<LegalKey, AppPathname>;

export async function getLegalMetadata(key: LegalKey): Promise<Metadata> {
  const { legal, meta } = await getMessages();
  return pageMetadata({
    path: PATHS[key],
    title: `${legal[key].h1} – ${meta.siteName}`,
    description: legal[key].lead,
  });
}

/**
 * Privacy policy and terms. The text lives in the `legal` namespace of the
 * messages files as a list of { title, text } sections, so the owner can add,
 * remove or reword sections there (a line break starts a new paragraph). Text in [BRACKETS] is a placeholder;
 * tokens like {orgNr} are filled from src/config/company.ts.
 */
export async function LegalPage({ pageKey }: { pageKey: LegalKey }) {
  const { legal } = await getMessages();
  const footer = await getTranslations("footer");
  const meta = await getTranslations("meta");
  const page = legal[pageKey];

  return (
    <article className="container-site pt-10 pb-16 md:pt-14 md:pb-24">
      <div className="flex max-w-[760px] flex-col gap-10">
        <header className="flex flex-col gap-4">
          <h1 className="text-h1-sm md:text-h1-page">{page.h1}</h1>
          <p className="text-lead text-muted">{page.lead}</p>
        </header>

        {page.sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-2">
            <h2 className="text-2xl leading-tight">{section.title}</h2>
            {section.text.split("\n").map((line) => (
              <p key={line} className="leading-[1.6]">
                {line}
              </p>
            ))}
          </section>
        ))}

        <section className="flex flex-col gap-2">
          <h2 className="text-2xl leading-tight">{footer("contact")}</h2>
          <p className="leading-[1.6]">{legal.contactText}</p>
          <p className="leading-[1.6] font-semibold">{legal.company}</p>
          <ul>
            <li>
              <a
                href={meta("phoneHref")}
                className="inline-flex min-h-11 items-center font-semibold"
              >
                {meta("phone")}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${footer("email")}`}
                className="inline-flex min-h-11 items-center font-semibold"
              >
                {footer("email")}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </article>
  );
}
