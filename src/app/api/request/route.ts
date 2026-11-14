import {
  looksLikeSpam,
  requestSchema,
  spamGuardSchema,
} from "@/lib/forms/schemas";
import { sendRequestEmails } from "@/lib/email/send";

/*
 * POST /api/request – receives the booking wizard and the quote form.
 * Nothing is stored: the request is validated (same zod schemas as the
 * forms) and sent by email with Resend.
 *
 * No `runtime` export: Cache Components does not allow it, and Route
 * Handlers already run on Node.js (the default).
 *
 * Never log form contents here.
 */

/** Generous upper bound for a form post (the real ones are ~1 KB). */
const MAX_BODY_BYTES = 20_000;

const json = (body: object, status = 200) => Response.json(body, { status });

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "too_large" }, 413);
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: "too_large" }, 413);
    }
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const guard = spamGuardSchema.safeParse(body);
  if (!guard.success) {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  // Honeypot filled in or sent too fast: pretend it worked, send nothing,
  // so a bot gets no hint about what gave it away.
  if (looksLikeSpam(guard.data)) {
    return json({ ok: true });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, error: "invalid" }, 422);
  }

  const result = await sendRequestEmails(parsed.data);
  if (!result.ok) {
    return json({ ok: false, error: "send_failed" }, 502);
  }
  return json({ ok: true });
}
