import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { CheckList } from "@/components/ui/CheckList";
import { Eyebrow } from "@/components/sections/Eyebrow";
import { SiteImage } from "@/components/sections/SiteImage";
import { hasImage } from "@/config/images";
import { Steps, type Step } from "@/components/sections/Steps";
import { EndCta } from "@/components/sections/EndCta";

type Sector = { name: string; text: string };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business");
  return pageMetadata({
    path: "/foretag",
    title: t("title"),
    description: t("lead"),
  });
}

export default async function BusinessPage() {
  const t = await getTranslations("business");
  const meta = await getTranslations("meta");

  const trust = t.raw("trust") as string[];
  const sectors = t.raw("sectors") as Sector[];
  const how = t.raw("how") as Step[];

  return (
    <>
      {/* Hero */}
      <section
        className={`container-site grid items-center gap-12 pt-12 pb-14 md:pt-18 md:pb-16 ${
          hasImage("business") ? "lg:grid-cols-2" : ""
        }`}
      >
        <div className="flex max-w-[820px] flex-col gap-5">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="text-h1-sm md:text-h1-page">{t("h1")}</h1>
          <p className="max-w-[620px] text-lead text-muted">{t("lead")}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/offert" className={buttonClasses("primary")}>
              {t("cta")}
            </Link>
            <a href={meta("phoneHref")} className={buttonClasses("secondary")}>
              {t("callCta")}
            </a>
          </div>
          <CheckList items={trust} inline className="mt-2" />
        </div>
        <SiteImage
          name="business"
          alt={t("photoAlt")}
          preload
          className="h-[280px] sm:h-[360px] lg:h-[440px]"
        />
      </section>

      {/* Sectors */}
      <section
        aria-labelledby="sectors-title"
        className="container-site flex flex-col gap-6 pb-14 md:pb-18"
      >
        <h2 id="sectors-title" className="text-h2-sm md:text-h2">
          {t("sectorsTitle")}
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => (
            <li
              key={sector.name}
              className={`flex flex-col gap-2 ${cardClasses}`}
            >
              <h3 className="text-[21px] leading-tight">{sector.name}</h3>
              <p className="leading-[1.55] text-muted">{sector.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works, on tint, directly followed by the end CTA band */}
      <Steps title={t("howTitle")} steps={how} className="bg-tint" />

      <EndCta
        title={t("endTitle")}
        text={t("endText")}
        cta={t("endCta")}
        href="/offert"
      />
    </>
  );
}
