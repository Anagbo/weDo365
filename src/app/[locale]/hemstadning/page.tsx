import {
  ServicePage,
  getServicePageMetadata,
} from "@/components/service-page/ServicePage";

export function generateMetadata() {
  return getServicePageMetadata("homeCleaning");
}

export default function HomeCleaningPage() {
  return <ServicePage pageKey="homeCleaning" />;
}
