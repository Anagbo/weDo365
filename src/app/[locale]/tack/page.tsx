import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import { buttonClasses } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { CheckIcon } from "@/components/ui/CheckIcon";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("thanks");
  // /tack is noindex (see NOINDEX_PATHS in src/lib/seo.ts).
  return pageMetadata({
    path: "/tack",
    title: t("title"),
    description: t("text"),
  });
}

export default async function ThanksPage() {
  const t = await getTranslations("thanks");
  const meta = await getTranslations("meta");
  const next = t.raw("next") as string[];

  return (
    <section className="mx-auto flex max-w-[720px] flex-col items-start gap-6 px-6 py-16 md:py-24">
      <span
        aria-hidden="true"
        className="grid size-[72px] place-items-center rounded-full bg-tint"
      >
        <CheckIcon className="size-9" />
      </span>
      <h1 className="text-h1-sm md:text-h1-page">{t("h1")}</h1>
      <p className="max-w-[620px] text-lead text-muted">{t("text")}</p>

      <div className={`flex w-full flex-col gap-4 ${cardClasses}`}>
        <h2 className="text-[22px] leading-tight">{t("nextTitle")}</h2>
        <ol className="flex flex-col gap-3.5">
          {next.map((item, i) => (
            <li
              key={item}
              className="flex items-start gap-3 text-[17px] leading-normal"
            >
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
      </div>

      <p>
        {t("questions")}{" "}
        <a href={meta("phoneHref")} className="font-semibold">
          {meta("phone")}
        </a>
      </p>
      <Link href="/" className={buttonClasses("secondary")}>
        {t("home")}
      </Link>
    </section>
  );
}
