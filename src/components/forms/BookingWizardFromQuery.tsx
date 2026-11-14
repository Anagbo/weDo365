"use client";

import type { ComponentProps } from "react";
import { useSearchParams } from "next/navigation";
import { SERVICE_IDS, SERVICE_QUERY_KEY, type ServiceId } from "@/config/site";
import { BookingWizard } from "./BookingWizard";

function isServiceId(value: string | null): value is ServiceId {
  return SERVICE_IDS.includes(value as ServiceId);
}

/**
 * Reads ?tjanst= (sv) or ?service= (en) and preselects that service.
 * Render inside <Suspense>: on the static page the fallback shows the
 * wizard with the default service until the browser has the URL.
 */
export function BookingWizardFromQuery(
  props: Omit<ComponentProps<typeof BookingWizard>, "initialService">,
) {
  const params = useSearchParams();
  // Accept either language's key, so a shared link works in both.
  const raw =
    params.get(SERVICE_QUERY_KEY.sv) ?? params.get(SERVICE_QUERY_KEY.en);
  const service: ServiceId = isServiceId(raw) ? raw : "hem";

  // A new preselected service (e.g. from a footer link) starts a fresh wizard.
  return <BookingWizard key={service} initialService={service} {...props} />;
}
