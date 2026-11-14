import { requestSchema } from "@/lib/forms/schemas";

/*
 * STUB (phase 4): validates the payload with the same zod schemas as the
 * forms and answers { ok: true }. Nothing is sent or stored.
 * Phase 5 adds the honeypot, the minimum fill time and the Resend emails.
 *
 * No `runtime` export: Cache Components does not allow it, and this
 * handler already runs on Node.js (the default).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  return Response.json({ ok: true });
}
