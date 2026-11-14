import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("book");
  return { title: t("title") };
}

export default async function BookPage() {
  const t = await getTranslations("book");
  return <PagePlaceholder title={t("h1")} lead={t("lead")} />;
}
