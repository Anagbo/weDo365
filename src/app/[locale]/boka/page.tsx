import { Suspense } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { BookingWizard } from "@/components/forms/BookingWizard";
import { BookingWizardFromQuery } from "@/components/forms/BookingWizardFromQuery";
import { ConsentText } from "@/components/forms/ConsentText";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("book");
  return { title: t("title") };
}

export default async function BookPage() {
  const t = await getTranslations("book");
  const { book, errors, ui, meta } = await getMessages();
  const consent = <ConsentText text={t("consent")} />;

  return (
    <section className="container-site flex flex-col gap-7 pt-10 pb-16 md:pt-12 md:pb-20">
      <div className="flex flex-col gap-3">
        <h1 className="text-h1-sm md:text-h1-page">{t("h1")}</h1>
        <p className="max-w-[620px] text-lead text-muted">{t("lead")}</p>
      </div>

      {/* Only the text the wizard needs is sent to the browser. */}
      <NextIntlClientProvider messages={{ book, errors, ui, meta }}>
        <Suspense
          fallback={<BookingWizard initialService="hem" consent={consent} />}
        >
          <BookingWizardFromQuery consent={consent} />
        </Suspense>
      </NextIntlClientProvider>
    </section>
  );
}
