import { LegalPage, getLegalMetadata } from "@/components/legal/LegalPage";

export function generateMetadata() {
  return getLegalMetadata("privacy");
}

export default function PrivacyPage() {
  return <LegalPage pageKey="privacy" />;
}
