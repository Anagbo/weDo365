import type { ComponentProps } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { bookHref, type ServiceId } from "@/config/site";
import { PostalAddress } from "@/components/PostalAddress";

type Href = ComponentProps<typeof Link>["href"];

const linkClass =
  "inline-flex min-h-11 items-center text-[15px] text-white/85 no-underline hover:text-white hover:underline";

function Column({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <h2
        id={id ? `${id}-title` : undefined}
        className="mb-3 font-sans text-eyebrow text-white uppercase"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const meta = await getTranslations("meta");
  const serviceLabels = t.raw("serviceLinks") as string[];

  // Same order as footer.serviceLinks in the messages files.
  const serviceTargets: Href[] = [
    "/hemstadning",
    ...(["flytt", "stor", "fonster"] satisfies ServiceId[]).map((id) =>
      bookHref(locale, id),
    ),
    "/foretag",
  ];

  return (
    <footer className="mt-auto bg-ink text-white [&_:focus-visible]:outline-white">
      <div className="container-site grid gap-8 pt-14 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        <section id="om" className="flex flex-col gap-2.5">
          <p className="font-heading text-[22px] font-extrabold tracking-[-0.02em] text-white">
            {meta("siteName")}
          </p>
          <p className="text-[15px] text-white/85">{t("about")}</p>
          <p className="text-sm text-white/85">{t("org")}</p>
        </section>

        <Column title={t("services")}>
          <ul>
            {serviceLabels.map((label, i) => (
              <li key={label}>
                <Link href={serviceTargets[i]} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </Column>

        <Column id="kontakt" title={t("contact")}>
          <ul>
            <li>
              <a href={meta("phoneHref")} className={linkClass}>
                {meta("phone")}
              </a>
            </li>
            <li>
              <a href={`mailto:${t("email")}`} className={linkClass}>
                {t("email")}
              </a>
            </li>
            <li className="flex min-h-11 items-center text-[15px] text-white/85">
              {t("area")}
            </li>
          </ul>
          <PostalAddress
            label={t("postalAddress")}
            className="mt-2 text-sm text-white/85"
          />
        </Column>

        <Column title={t("legal")}>
          <ul>
            <li>
              <Link href="/integritetspolicy" className={linkClass}>
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/villkor" className={linkClass}>
                {t("terms")}
              </Link>
            </li>
          </ul>
        </Column>
      </div>

      <div className="container-site pb-8">
        <p className="border-t border-white/15 pt-5 text-sm text-white/75">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
