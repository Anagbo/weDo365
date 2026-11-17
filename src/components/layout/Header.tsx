import { getLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { socialLinks } from "@/config/company";
import { Logo } from "@/components/Logo";
import { LanguageSwitch } from "./LanguageSwitch";
import { SiteNav, type NavItem, type SocialItem } from "./SiteNav";

export async function Header() {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const meta = await getTranslations("meta");
  const ui = await getTranslations("ui");
  const footer = await getTranslations("footer");

  const target = routing.locales.find((l) => l !== locale) ?? "en";

  const items: NavItem[] = [
    { label: t("homes"), href: "/hemstadning" },
    { label: t("business"), href: "/foretag" },
    { label: t("howItWorks"), href: { pathname: "/", hash: "hur" } },
    { label: t("about"), href: { pathname: "/", hash: "om" } },
    { label: t("contact"), href: { pathname: "/", hash: "kontakt" } },
  ];

  const social: SocialItem[] = socialLinks().map((link) => ({
    id: link.id,
    url: link.url,
    ariaLabel: footer(`${link.id}Aria`),
  }));

  return (
    <header className="border-b border-line bg-ground">
      <SiteNav
        logo={<Logo />}
        languageSwitch={
          <LanguageSwitch
            target={target}
            label={t("switchLabel")}
            ariaLabel={t("switchAria")}
          />
        }
        items={items}
        social={social}
        navLabel={t("menuLabel")}
        menuButtonLabel={ui("menu")}
        call={{
          label: `${t("call")} ${meta("phone")}`,
          href: meta("phoneHref"),
        }}
        cta={t("cta")}
      />
    </header>
  );
}
