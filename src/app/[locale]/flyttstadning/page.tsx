import {
  ServicePage,
  getServicePageMetadata,
} from "@/components/service-page/ServicePage";

export function generateMetadata() {
  return getServicePageMetadata("moveOut");
}

export default function MoveOutPage() {
  return <ServicePage pageKey="moveOut" />;
}
