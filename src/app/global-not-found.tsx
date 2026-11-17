import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Manrope } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import "./globals.css";

/*
 * 404 page for every URL that matches no page (see `globalNotFound` in
 * next.config.ts). It bypasses the language layout, so it builds the same
 * page frame itself: header, footer, and the language of the URL (the
 * next-intl proxy sets `x-next-intl-locale` on every request; Swedish at the
 * root, English under /en). The text is in the `notFound` namespace.
 */

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

// The page reads the request (for the language), so it is rendered per request.
export const instant = false;

export const metadata: Metadata = {
  title: "404 – WeDo365",
};

export default async function GlobalNotFound() {
  const requested = (await headers()).get("x-next-intl-locale");
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  setRequestLocale(locale);

  const t = await getTranslations("notFound");
  const ui = await getTranslations("ui");
  const nav = await getTranslations("nav");
  const meta = await getTranslations("meta");

  const links = [
    { href: "/hemstadning", label: t("homeCleaning") },
    { href: "/foretag", label: t("business") },
  ] as const;

  return (
    <html lang={locale} className={`${inter.variable} ${manrope.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded-full bg-ink font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:inline-flex focus:min-h-12 focus:items-center focus:px-5"
        >
          {ui("skipLink")}
        </a>
        <NextIntlClientProvider locale={locale} messages={null}>
          <Header switchToHome />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            <section className="container-site flex flex-col items-start gap-5 py-12 md:py-18">
              <h1 className="text-h1-sm md:text-h1-page">{t("h1")}</h1>
              <p className="max-w-[620px] text-lead text-muted">{t("text")}</p>
              <Link href="/" className={buttonClasses("primary")}>
                {t("home")}
              </Link>
              <nav aria-label={t("helpTitle")} className="flex flex-col gap-1">
                <p className="font-semibold">{t("helpTitle")}</p>
                <ul>
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 items-center underline underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <a
                      href={meta("phoneHref")}
                      className="inline-flex min-h-11 items-center underline underline-offset-4"
                    >
                      {nav("call")} {meta("phone")}
                    </a>
                  </li>
                </ul>
              </nav>
            </section>
          </main>
          <Footer />
          <MobileActionBar
            call={{
              label: nav("call"),
              aria: `${nav("call")} ${meta("phone")}`,
              href: meta("phoneHref"),
            }}
            cta={nav("cta")}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
