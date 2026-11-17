import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { bookHref, SERVICE_IDS, SHOW_REVIEWS, SITE_URL } from "@/config/site";
import Image from "next/image";
import { hasImage, LOGO } from "@/config/images";
import { companyJsonLd } from "@/config/company";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { buttonClasses } from "@/components/ui/button";
import { cardClasses, cardFeaturedClasses } from "@/components/ui/card";
import { CheckIcon } from "@/components/ui/CheckIcon";
import { Eyebrow } from "@/components/sections/Eyebrow";
import { SiteImage } from "@/components/sections/SiteImage";
import { Steps, type Step } from "@/components/sections/Steps";
import { Faq, type FaqItem } from "@/components/sections/Faq";
import { EndCta } from "@/components/sections/EndCta";

type Href = ComponentProps<typeof Link>["href"];

type ServiceCard = {
  name: string;
  text: string;
  link: string;
  target: "homeCleaning" | "book";
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return pageMetadata({
    path: "/",
    title: t("title"),
    description: t("lead"),
  });
}

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

function Stars() {
  return (
    <div aria-hidden="true" className="flex gap-0.5 text-accent">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="18" height="18">
          <path
            fill="currentColor"
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
          />
        </svg>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const about = await getTranslations("about");

  const trust = [
    ...(t.raw("trust") as string[]),
    ...(SHOW_REVIEWS ? [t("trustReviews")] : []),
  ];
  const services = t.raw("services") as ServiceCard[];
  const how = t.raw("how") as Step[];
  const faq = t.raw("faq") as FaqItem[];
  const facts = about.raw("facts") as string[];

  // home.services is in the same order as the wizard's service ids.
  const serviceHref = (service: ServiceCard, i: number): Href =>
    service.target === "homeCleaning"
      ? "/hemstadning"
      : bookHref(locale, SERVICE_IDS[i]);

  const doors = [
    {
      key: "homes",
      card: cardFeaturedClasses,
      button: buttonClasses("primary"),
      href: "/boka" as const,
      ...(t.raw("doorHomes") as DoorText),
    },
    {
      key: "business",
      card: cardClasses,
      button: buttonClasses("secondary"),
      href: "/offert" as const,
      ...(t.raw("doorBusiness") as DoorText),
    },
  ];

  return (
    <>
      <JsonLd data={companyJsonLd(SITE_URL)} />

      {/* 1. Hero */}
      <section
        className={`container-site grid items-center gap-12 pt-12 pb-10 md:pt-18 md:pb-14 ${
          hasImage("hero") ? "lg:grid-cols-2" : ""
        }`}
      >
        <div className="flex max-w-[820px] flex-col gap-5">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="text-h1-sm md:text-h1">{t("h1")}</h1>
          <p className="max-w-[620px] text-lead text-muted">{t("lead")}</p>
        </div>
        <SiteImage
          name="hero"
          alt={t("heroPhotoAlt")}
          preload
          className="h-[280px] sm:h-[360px] lg:h-[440px]"
        />
      </section>

      {/* 2. Doors: homes / business */}
      <div className="container-site grid gap-6 md:grid-cols-2">
        {doors.map((door) => (
          <section
            key={door.key}
            aria-labelledby={`door-${door.key}`}
            className={`relative flex flex-col gap-3 ${door.card}`}
          >
            <h2
              id={`door-${door.key}`}
              className="text-[26px] leading-tight md:text-[30px]"
            >
              {door.title}
            </h2>
            <p className="text-[17px] leading-[1.55] text-muted">{door.text}</p>
            <p className="text-base font-semibold text-green">{door.note}</p>
            {/* The link covers the whole card (after:inset-0), like the prototype. */}
            <Link
              href={door.href}
              className={`${door.button} mt-2 self-start after:absolute after:inset-0 after:rounded-card`}
            >
              {door.cta}
              <Arrow />
            </Link>
          </section>
        ))}
      </div>

      {/* 3. Trust bar */}
      <div className="container-site pt-10 pb-6">
        <ul className="flex flex-wrap justify-between gap-x-10 gap-y-4 border-y border-line py-5">
          {trust.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-base font-medium"
            >
              <CheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Services for homes */}
      <section
        aria-labelledby="services-title"
        className="container-site flex flex-col gap-7 pt-12 pb-6 md:pt-16"
      >
        <h2 id="services-title" className="text-h2-sm md:text-h2">
          {t("servicesTitle")}
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <li
              key={service.name}
              className={`flex flex-col gap-2.5 ${cardClasses}`}
            >
              <h3 className="text-[22px] leading-tight">{service.name}</h3>
              <p className="flex-1 leading-[1.55] text-muted">{service.text}</p>
              <Link
                href={serviceHref(service, i)}
                className="flex min-h-11 items-center gap-1.5 font-semibold underline underline-offset-4 hover:text-ink"
              >
                {service.link}
                <span className="sr-only"> – {service.name}</span>
                <Arrow />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. How it works */}
      <Steps id="hur" title={t("howTitle")} steps={how} />

      {/* 6. Business band */}
      <section
        aria-labelledby="business-title"
        className={`container-site grid items-center gap-12 py-14 md:py-20 ${
          hasImage("businessBand") ? "lg:grid-cols-2" : ""
        }`}
      >
        <SiteImage
          name="businessBand"
          alt={t("businessPhotoAlt")}
          className="h-[260px] sm:h-[360px]"
        />
        <div className="flex max-w-[820px] flex-col gap-[18px]">
          <Eyebrow>{t("doorBusiness.title")}</Eyebrow>
          <h2 id="business-title" className="text-h2-sm md:text-h2">
            {t("businessTitle")}
          </h2>
          <p className="max-w-[620px] text-lead text-muted">
            {t("businessText")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/offert" className={buttonClasses("primary")}>
              {t("businessCta")}
            </Link>
            <Link href="/foretag" className={buttonClasses("secondary")}>
              {t("businessCta2")}
              <span className="sr-only"> – {t("businessTitle")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6b. About us (the #om target) */}
      <section
        id="om"
        aria-labelledby="about-title"
        className={`container-site grid scroll-mt-24 items-center gap-12 py-6 md:py-10 ${
          hasImage("about") ? "lg:grid-cols-2" : ""
        }`}
      >
        <SiteImage
          name="about"
          alt={t("aboutPhotoAlt")}
          className="h-[280px] sm:h-[360px] lg:order-2"
        />
        <div className="flex max-w-[820px] flex-col gap-[18px]">
          <Eyebrow>{about("eyebrow")}</Eyebrow>
          <h2 id="about-title" className="text-h2-sm md:text-h2">
            {about("title")}
          </h2>
          <p className="max-w-[620px] text-lead text-muted">{about("text")}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          {/* Small raster logo with a cream background: on a white card, never enlarged. */}
          <div className="mt-2 w-fit rounded-card border border-line bg-white p-3">
            <Image
              src={LOGO.src}
              width={LOGO.width}
              height={LOGO.height}
              alt={about("logoAlt")}
              unoptimized
              className="h-auto w-[216px]"
            />
          </div>
        </div>
      </section>

      {/* 7. Reviews: only while SHOW_REVIEWS is on (no real reviews yet) */}
      {SHOW_REVIEWS ? (
        <section
          aria-labelledby="reviews-title"
          className="container-site flex flex-col gap-6 pt-6 pb-14 md:pb-18"
        >
          <div className="flex flex-col gap-1.5">
            <h2 id="reviews-title" className="text-h2-sm md:text-h2">
              {t("reviewsTitle")}
            </h2>
            <p className="text-muted">{t("reviewsSub")}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <figure
                key={n}
                className={`flex flex-col gap-3.5 ${cardClasses}`}
              >
                <Stars />
                <blockquote className="text-[17px] leading-[1.55]">
                  {t("reviewPlaceholder")}
                </blockquote>
                <figcaption className="text-sm text-muted">
                  {t("reviewName")}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* 8. FAQ (questions without an answer yet are left out) */}
      <Faq title={t("faqTitle")} items={faq} />

      {/* 9. End CTA */}
      <EndCta
        title={t("endTitle")}
        text={t("endText")}
        cta={t("endCta")}
        href="/boka"
      />
    </>
  );
}

type DoorText = { title: string; text: string; note: string; cta: string };
