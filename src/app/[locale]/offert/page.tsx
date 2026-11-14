import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { ConsentText } from "@/components/forms/ConsentText";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("quote");
  return { title: t("title") };
}

export default async function QuotePage() {
  const t = await getTranslations("quote");
  const meta = await getTranslations("meta");
  const { quote, errors, ui, meta: metaMessages } = await getMessages();
  const side = t.raw("side") as string[];

  return (
    <section className="container-site grid items-start gap-10 pt-10 pb-16 md:pt-14 md:pb-20 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <h1 className="text-h1-sm md:text-h1-page">{t("h1")}</h1>
        <p className="max-w-[620px] text-lead text-muted">{t("lead")}</p>
        {/* Only the text the form needs is sent to the browser. */}
        <NextIntlClientProvider
          messages={{ quote, errors, ui, meta: metaMessages }}
        >
          <QuoteForm consent={<ConsentText text={t("consent")} />} />
        </NextIntlClientProvider>
      </div>

      <aside
        aria-labelledby="quote-next-title"
        className="flex flex-col gap-[18px] rounded-card bg-tint p-7"
      >
        <h2 id="quote-next-title" className="text-2xl leading-tight">
          {t("sideTitle")}
        </h2>
        <ol className="flex flex-col gap-3.5">
          {side.map((item, i) => (
            <li key={item} className="flex items-start gap-3 leading-normal">
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-full bg-green text-sm font-bold text-white"
              >
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        <p>
          {t("sideCall")}{" "}
          <a href={meta("phoneHref")} className="font-semibold">
            {meta("phone")}
          </a>
        </p>
      </aside>
    </section>
  );
}
