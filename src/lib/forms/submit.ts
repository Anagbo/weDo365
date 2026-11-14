import type { RequestPayload, SpamGuard } from "./schemas";

/**
 * Posts a request to /api/request together with the spam-guard fields.
 * Resolves to true only on { ok: true }.
 */
export async function postRequest(
  payload: RequestPayload,
  guard: SpamGuard,
): Promise<boolean> {
  try {
    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, ...guard }),
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
