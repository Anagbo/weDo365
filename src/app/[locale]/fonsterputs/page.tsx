import {
  ServicePage,
  getServicePageMetadata,
} from "@/components/service-page/ServicePage";

export function generateMetadata() {
  return getServicePageMetadata("windowCleaning");
}

export default function WindowCleaningPage() {
  return <ServicePage pageKey="windowCleaning" />;
}
