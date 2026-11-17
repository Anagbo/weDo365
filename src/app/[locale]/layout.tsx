import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/config/site";
import { IS_PRODUCTION_BUILD } from "@/config/indexing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import "../globals.css";

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

// Every page is fully static; this fails the build if one stops being so.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...(IS_PRODUCTION_BUILD ? {} : { robots: { index: false, follow: false } }),
};

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  const ui = await getTranslations("ui");
  const nav = await getTranslations("nav");
  const meta = await getTranslations("meta");

  return (
    <html lang={locale} className={`${inter.variable} ${manrope.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded-full bg-ink font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:inline-flex focus:min-h-12 focus:items-center focus:px-5"
        >
          {ui("skipLink")}
        </a>
        {/* Client components get no messages here; forms pass their own. */}
        <NextIntlClientProvider messages={null}>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
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
