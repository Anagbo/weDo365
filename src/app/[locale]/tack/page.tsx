import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("thanks");
  return { title: t("title") };
}

export default async function ThanksPage() {
  const t = await getTranslations("thanks");
  return <PagePlaceholder title={t("h1")} lead={t("text")} />;
}
