import type { RequestPayload } from "./schemas";

/** Posts a request to /api/request. Resolves to true only on { ok: true }. */
export async function postRequest(payload: RequestPayload): Promise<boolean> {
  try {
    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return false;
    const body: unknown = await res.json();
    return (
      typeof body === "object" &&
      body !== null &&
      (body as { ok?: unknown }).ok === true
    );
  } catch {
    return false;
  }
}
