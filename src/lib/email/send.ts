import { Resend } from "resend";
import { SITE_URL } from "@/config/site";
import type { RequestPayload } from "@/lib/forms/schemas";
import { buildCustomerEmail, buildOwnerEmail } from "./templates";

type Config = {
  apiKey: string;
  from: string;
  owner: string;
  /** Reply-To of the customer copy. Defaults to the owner inbox. */
  replyTo: string;
};

function readConfig(): Config | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const owner = process.env.MAIL_TO_OWNER;
  if (!apiKey || !from || !owner) return null;
  const replyTo = process.env.MAIL_REPLY_TO?.trim() || owner;
  return { apiKey, from, owner, replyTo };
}

export type SendResult =
  | { ok: true; customerSent: boolean }
  | { ok: false; reason: "not_configured" | "owner_failed" };

/**
 * Sends the owner email (must succeed) and then the customer copy.
 * If only the customer copy fails, the request still counts as received:
 * the owner has it. Never logs form contents, only error names and codes.
 */
export async function sendRequestEmails(
  req: RequestPayload,
  receivedAt = new Date(),
): Promise<SendResult> {
  const config = readConfig();
  if (!config) {
    console.error(
      "[request] Email is not configured: set RESEND_API_KEY, MAIL_FROM and MAIL_TO_OWNER.",
    );
    return { ok: false, reason: "not_configured" };
  }

  const resend = new Resend(config.apiKey);
  const customerEmail = req.email;

  const owner = buildOwnerEmail(req, receivedAt);
  try {
    const { error } = await resend.emails.send({
      from: config.from,
      to: config.owner,
      replyTo: customerEmail,
      subject: owner.subject,
      html: owner.html,
      text: owner.text,
    });
    if (error) {
      console.error(
        "[request] Owner email failed:",
        error.name,
        error.statusCode,
      );
      return { ok: false, reason: "owner_failed" };
    }
  } catch (e) {
    console.error("[request] Owner email failed:", (e as Error)?.name);
    return { ok: false, reason: "owner_failed" };
  }

  const customer = buildCustomerEmail(req, new URL(SITE_URL).host);
  try {
    const { error } = await resend.emails.send({
      from: config.from,
      to: customerEmail,
      replyTo: config.replyTo,
      subject: customer.subject,
      html: customer.html,
      text: customer.text,
    });
    if (error) {
      console.error(
        "[request] Customer email failed:",
        error.name,
        error.statusCode,
      );
      return { ok: true, customerSent: false };
    }
  } catch (e) {
    console.error("[request] Customer email failed:", (e as Error)?.name);
    return { ok: true, customerSent: false };
  }

  return { ok: true, customerSent: true };
}
