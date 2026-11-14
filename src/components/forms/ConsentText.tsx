import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { linkText } from "@/lib/link-text";

/** The forms' consent sentence, with "integritetspolicy" linked. */
export async function ConsentText({ text }: { text: string }) {
  const footer = await getTranslations("footer");
  return linkText(text, footer("privacy"), (match) => (
    <Link
      href="/integritetspolicy"
      className="underline underline-offset-4 hover:text-ink"
    >
      {match}
    </Link>
  ));
}
