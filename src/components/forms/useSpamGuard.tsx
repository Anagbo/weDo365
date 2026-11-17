"use client";

import { useCallback, useEffect, useRef, type Ref } from "react";
import { HONEYPOT_FIELD, type SpamGuard } from "@/lib/forms/schemas";

/**
 * The trap field. aria-hidden + inert: not read by screen readers, not
 * focusable, not reachable by tabbing. Off-screen rather than display:none,
 * because simple bots skip fields that are display:none. Password managers
 * are told to leave it alone too.
 */
export function HoneypotField({ ref }: { ref?: Ref<HTMLInputElement> }) {
  return (
    <div
      aria-hidden="true"
      inert
      className="pointer-events-none absolute -left-[10000px] size-px overflow-hidden"
    >
      <label aria-hidden="true">
        Website
        <input
          ref={ref}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          defaultValue=""
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
        />
      </label>
    </div>
  );
}

/**
 * Honeypot field + fill timer for a form.
 *
 * - `honeypot`: render it inside the <form>. It is off-screen and hidden from
 *   assistive technology, so people never fill it in; simple bots do.
 * - `read()`: the values to send with the request.
 * - `restart()`: call after a successful send.
 *
 * The timer starts the first time the form is shown and is NOT restarted
 * when Next.js shows a kept-alive page again (<Activity>), so someone who
 * leaves and comes back to a filled-in form is not mistaken for a bot.
 */
export function useSpamGuard() {
  const startedAt = useRef<number | null>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startedAt.current === null) startedAt.current = Date.now();
  }, []);

  const read = useCallback(
    (): SpamGuard => ({
      [HONEYPOT_FIELD]: field.current?.value ?? "",
      fillMs: startedAt.current === null ? 0 : Date.now() - startedAt.current,
    }),
    [],
  );

  const restart = useCallback(() => {
    startedAt.current = null;
    if (field.current) field.current.value = "";
  }, []);

  const honeypot = <HoneypotField ref={field} />;

  return { honeypot, read, restart };
}
