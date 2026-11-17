import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EMBLEM } from "@/config/images";

/** Header logo: the wide emblem (transparent PNG) + the wordmark text. */
export async function Logo() {
  const t = await getTranslations("nav");
  const siteName = (await getTranslations("meta"))("siteName");

  return (
    <Link
      href="/"
      aria-label={t("homeAria")}
      className="inline-flex min-h-11 items-center gap-2 text-ink no-underline sm:gap-2.5"
    >
      {/* alt="" because the link has its own accessible name. 338×140 source:
          shown at 36px (mobile) / 48px (md+) tall, so 2x never upscales it. */}
      <Image
        src={EMBLEM.src}
        width={EMBLEM.width}
        height={EMBLEM.height}
        alt=""
        preload
        quality={80}
        sizes="(min-width: 768px) 116px, 87px"
        className="h-9 w-auto md:h-12"
      />
      <span
        aria-hidden="true"
        className="font-heading text-[18px] font-extrabold tracking-[-0.02em] max-[379px]:hidden sm:text-[21px]"
      >
        {siteName}
      </span>
    </Link>
  );
}
