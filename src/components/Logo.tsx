import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EMBLEM } from "@/config/images";

/**
 * The one logo of the site: emblem (transparent PNG) + wordmark, linking to
 * the home page. `color` is for the light header; `white` is the monochrome
 * version that sits directly on the dark footer.
 */
export async function Logo({
  variant = "color",
}: {
  variant?: "color" | "white";
}) {
  const t = await getTranslations("nav");
  const siteName = (await getTranslations("meta"))("siteName");
  const emblem = EMBLEM[variant];

  return (
    <Link
      href="/"
      aria-label={t("homeAria")}
      className={`inline-flex min-h-11 items-center gap-2 no-underline sm:gap-2.5 ${
        variant === "white" ? "text-white" : "text-ink"
      }`}
    >
      {/* alt="" because the link has its own accessible name. 338×140 source:
          shown at 36px (mobile) / 48px (md+) tall, so 2x never upscales it.
          Width and height are set, so nothing shifts while it loads. */}
      <Image
        src={emblem.src}
        width={emblem.width}
        height={emblem.height}
        alt=""
        preload={variant === "color"}
        quality={80}
        sizes="(min-width: 768px) 116px, 87px"
        className="h-9 w-auto md:h-12"
      />
      <span
        aria-hidden="true"
        data-testid="brand-wordmark"
        className="font-heading text-[18px] font-extrabold tracking-[-0.02em] max-[379px]:hidden sm:text-[21px]"
      >
        {siteName}
      </span>
    </Link>
  );
}
