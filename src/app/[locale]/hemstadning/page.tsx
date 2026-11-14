import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("homeCleaning");
  return { title: t("title") };
}

export default async function HomeCleaningPage() {
  const t = await getTranslations("homeCleaning");
  return <PagePlaceholder title={t("h1")} lead={t("lead")} />;
}
