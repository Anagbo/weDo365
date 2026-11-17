import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MIN_FILL_MS } from "@/lib/forms/schemas";
import { NOW, rawBusiness, rawHome } from "@/test/fixtures";

// No email is ever sent from a test.
const sendMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/email/send", () => ({ sendRequestEmails: sendMock }));

import { POST } from "./route";

const post = (body: object) =>
  POST(
    new Request("http://localhost/api/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  sendMock.mockReset();
  sendMock.mockResolvedValue({ ok: true });
});

afterEach(() => vi.useRealTimers());

describe("POST /api/request spam guard", () => {
  it("accepts a normal fill: empty honeypot, enough time", async () => {
    for (const request of [rawHome, rawBusiness]) {
      sendMock.mockClear();
      const res = await post({ ...request, website: "", fillMs: 12_000 });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
      expect(sendMock).toHaveBeenCalledTimes(1);
    }
  });

  it("rejects a filled honeypot: looks like success, sends nothing", async () => {
    const res = await post({
      ...rawHome,
      website: "http://spam.test",
      fillMs: 12_000,
    });
    expect(await res.json()).toEqual({ ok: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("keeps the minimum fill time", async () => {
    const tooFast = await post({
      ...rawHome,
      website: "",
      fillMs: MIN_FILL_MS - 1,
    });
    expect(await tooFast.json()).toEqual({ ok: true });
    expect(sendMock).not.toHaveBeenCalled();

    await post({ ...rawHome, website: "", fillMs: MIN_FILL_MS });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("still validates the form for a human-looking request", async () => {
    const res = await post({
      ...rawHome,
      email: "not-an-email",
      website: "",
      fillMs: 12_000,
    });
    expect(res.status).toBe(422);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
