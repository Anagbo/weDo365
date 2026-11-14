import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/** Placeholder logo until the real one arrives: green "W" square + wordmark. */
export async function Logo() {
  const t = await getTranslations("nav");
  const siteName = (await getTranslations("meta"))("siteName");

  return (
    <Link
      href="/"
      aria-label={t("homeAria")}
      className="inline-flex min-h-11 items-center gap-2.5 text-ink no-underline"
    >
      <span
        aria-hidden="true"
        className="grid size-[38px] place-items-center rounded-logo bg-green font-heading text-base font-extrabold text-white"
      >
        W
      </span>
      <span
        aria-hidden="true"
        className="font-heading text-[21px] font-extrabold tracking-[-0.02em]"
      >
        {siteName}
      </span>
    </Link>
  );
}
