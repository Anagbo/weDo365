import { LegalPage, getLegalMetadata } from "@/components/legal/LegalPage";

export function generateMetadata() {
  return getLegalMetadata("terms");
}

export default function TermsPage() {
  return <LegalPage pageKey="terms" />;
}
