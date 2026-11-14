import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("footer");
  const meta = await getTranslations("meta");
  return { title: `${t("terms")} – ${meta("siteName")}` };
}

// Full placeholder content follows in phase 6.
export default async function TermsPage() {
  const t = await getTranslations("footer");
  return <PagePlaceholder title={t("terms")} lead="[TEXT FRÅN WEDO365]" />;
}
