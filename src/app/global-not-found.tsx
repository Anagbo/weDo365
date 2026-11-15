import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Manrope } from "next/font/google";
import { MESSAGES } from "@/messages";
import { buttonClasses } from "@/components/ui/button";
import "./globals.css";

/*
 * 404 page for every URL that matches no page (see `globalNotFound` in
 * next.config.ts). It is one static page, so it cannot know the visitor's
 * language: it shows Swedish and English side by side. The text is in the
 * `notFound` namespace of the messages files.
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

const { sv, en } = MESSAGES;

export const metadata: Metadata = {
  title: `${sv.notFound.h1} / ${en.notFound.h1} – ${sv.meta.siteName}`,
};

export default function GlobalNotFound() {
  return (
    <html lang="sv" className={`${inter.variable} ${manrope.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <header className="container-site py-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-heading text-[21px] font-extrabold tracking-[-0.02em] text-ink no-underline"
          >
            {sv.meta.siteName}
          </Link>
        </header>

        <main className="container-site grid flex-1 content-start gap-12 py-10 md:grid-cols-2 md:py-16">
          <section lang="sv" className="flex flex-col items-start gap-5">
            <h1 className="text-h1-sm md:text-h1-page">{sv.notFound.h1}</h1>
            <p className="max-w-[620px] text-lead text-muted">
              {sv.notFound.text}
            </p>
            <Link href="/" className={buttonClasses("primary")}>
              {sv.notFound.home}
            </Link>
          </section>

          <section lang="en" className="flex flex-col items-start gap-5">
            <h2 className="text-h1-sm md:text-h1-page">{en.notFound.h1}</h2>
            <p className="max-w-[620px] text-lead text-muted">
              {en.notFound.text}
            </p>
            <Link href="/en" className={buttonClasses("secondary")}>
              {en.notFound.home}
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}
