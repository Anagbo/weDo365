import type { Metadata } from "next";
import type { Messages } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { bookHref } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { SERVICE_PAGES, type ServicePageKey } from "@/config/service-pages";
import { buttonClasses } from "@/components/ui/button";
import { cardClasses, cardFeaturedClasses } from "@/components/ui/card";
import { CheckList } from "@/components/ui/CheckList";
import { Breadcrumb } from "@/components/sections/Breadcrumb";
import { SiteImage } from "@/components/sections/SiteImage";
import { Faq } from "@/components/sections/Faq";
import { hasImage } from "@/config/images";
import { SECTION } from "@/components/ui/spacing";
import { hasTodo } from "@/lib/todo";
import { EndCta } from "@/components/sections/EndCta";

/**
 * Shape of a service page's messages namespace. Every service page uses the
 * same keys as `homeCleaning`; a namespace that differs fails typechecking.
 */
export type ServicePageContent = Messages["homeCleaning"];

async function getContent(key: ServicePageKey): Promise<ServicePageContent> {
  const messages = await getMessages();
  return messages[key];
}

export async function getServicePageMetadata(
  key: ServicePageKey,
): Promise<Metadata> {
  const content = await getContent(key);
  return pageMetadata({
    path: SERVICE_PAGES[key].path,
    title: content.title,
    description: content.lead,
  });
}

/** Template for a single home service (Hemstädning today, more later). */
export async function ServicePage({ pageKey }: { pageKey: ServicePageKey }) {
  const locale = await getLocale();
  const c = await getContent(pageKey);
  const { service, image } = SERVICE_PAGES[pageKey];
  const requestHref = bookHref(locale, service);
  const withPhoto = image !== null && hasImage(image);

  return (
    <>
      <Breadcrumb
        items={[
          { label: c.breadcrumbHome, href: "/" },
          // "För hemmet" has no page of its own: it links to the service list on the home page.
          {
            label: c.breadcrumbHomes,
            href: { pathname: "/", hash: "tjanster" },
          },
          { label: c.breadcrumbCurrent },
        ]}
      />

      <section
        className={`container-site grid items-start gap-12 pt-7 ${
          withPhoto ? "lg:grid-cols-2" : ""
        }`}
      >
        <div className="flex max-w-[820px] flex-col gap-6">
          <h1 className="text-h1-sm md:text-h1-page">{c.h1}</h1>
          <p className="max-w-[620px] text-lead text-muted">{c.lead}</p>

          <div className={`flex flex-col gap-4 ${cardFeaturedClasses}`}>
            <div>
              <h2 className="text-[26px] leading-tight">{c.cardTitle}</h2>
              <p className="mt-1 text-base text-muted">{c.cardText}</p>
            </div>
            <CheckList items={c.checks} />
            <Link
              href={requestHref}
              className={buttonClasses("primary", "self-start")}
            >
              {c.cta}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        {image ? (
          <SiteImage
            name={image}
            alt={c.photoAlt}
            preload
            className="h-[280px] sm:h-[400px] lg:h-[520px]"
          />
        ) : null}
      </section>

      <section
        aria-labelledby="who-title"
        className={`container-site flex flex-col gap-4 ${SECTION}`}
      >
        <h2 id="who-title" className="text-h2-sm md:text-h2">
          {c.whoTitle}
        </h2>
        <CheckList items={c.who} />
      </section>

      {/* Shown once the owner has filled in what is included. */}
      {hasTodo(c.included) ? null : (
        <section
          aria-labelledby="included-title"
          className={`container-site flex flex-col gap-6 ${SECTION}`}
        >
          <h2 id="included-title" className="text-h2-sm md:text-h2">
            {c.includedTitle}
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {c.included.map((group) => (
              <li
                key={group.title}
                className={`flex flex-col gap-3.5 ${cardClasses}`}
              >
                <h3 className="text-[21px] leading-tight">{group.title}</h3>
                <CheckList items={group.items} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Faq title={c.faqTitle} items={c.faq} />

      <EndCta
        title={c.endTitle}
        text={c.endText}
        cta={c.endCta}
        href={requestHref}
      />
    </>
  );
}
