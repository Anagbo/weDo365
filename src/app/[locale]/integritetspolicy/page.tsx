import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("footer");
  const meta = await getTranslations("meta");
  return { title: `${t("privacy")} – ${meta("siteName")}` };
}

// Full placeholder content follows in phase 6.
export default async function PrivacyPage() {
  const t = await getTranslations("footer");
  return <PagePlaceholder title={t("privacy")} lead="[TEXT FRÅN WEDO365]" />;
}
