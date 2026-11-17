import {
  ServicePage,
  getServicePageMetadata,
} from "@/components/service-page/ServicePage";

export function generateMetadata() {
  return getServicePageMetadata("deepCleaning");
}

export default function DeepCleaningPage() {
  return <ServicePage pageKey="deepCleaning" />;
}
