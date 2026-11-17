import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { NOW, parseRequest, rawBusiness, rawHome } from "@/test/fixtures";

// Replaces the Resend SDK: nothing here ever reaches the network.
const sendMock = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { sendRequestEmails } from "./send";

const OK = { data: { id: "email_1" }, error: null };
const FAIL = {
  data: null,
  error: { name: "internal_server_error", statusCode: 500, message: "boom" },
};

let errorLog: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});
afterAll(() => vi.useRealTimers());

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("MAIL_FROM", "WeDo365 <noreply@send.wedo365.se>");
  vi.stubEnv("MAIL_TO_OWNER", "info@wedo365.se");
  vi.stubEnv("MAIL_REPLY_TO", "info@wedo365.se");
  sendMock.mockReset();
  errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  errorLog.mockRestore();
});

/** Everything that was written to console.error, as one string. */
const logged = () => errorLog.mock.calls.flat().join(" ");

describe("sendRequestEmails", () => {
  it("sends the owner email first, then the customer copy", async () => {
    sendMock.mockResolvedValue(OK);
    const result = await sendRequestEmails(parseRequest(rawHome));

    expect(result).toEqual({ ok: true, customerSent: true });
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock.mock.calls[0][0].to).toBe("info@wedo365.se");
    expect(sendMock.mock.calls[1][0].to).toBe("anna@example.se");
  });

  it("sends from MAIL_FROM, and each reply goes to the other party", async () => {
    sendMock.mockResolvedValue(OK);
    await sendRequestEmails(parseRequest(rawHome));
    const [owner, customer] = sendMock.mock.calls.map(([payload]) => payload);

    expect(owner.from).toBe("WeDo365 <noreply@send.wedo365.se>");
    expect(customer.from).toBe("WeDo365 <noreply@send.wedo365.se>");
    expect(owner.replyTo).toBe("anna@example.se");
    expect(customer.replyTo).toBe("info@wedo365.se");
  });

  it("uses MAIL_REPLY_TO for the customer copy, and the owner inbox if it is not set", async () => {
    sendMock.mockResolvedValue(OK);
    vi.stubEnv("MAIL_REPLY_TO", "svar@wedo365.se");
    await sendRequestEmails(parseRequest(rawHome));
    expect(sendMock.mock.calls[1][0].replyTo).toBe("svar@wedo365.se");
    // The owner email always replies to the customer.
    expect(sendMock.mock.calls[0][0].replyTo).toBe("anna@example.se");

    sendMock.mockClear();
    vi.stubEnv("MAIL_REPLY_TO", "");
    await sendRequestEmails(parseRequest(rawHome));
    expect(sendMock.mock.calls[1][0].replyTo).toBe("info@wedo365.se");
  });

  it("sends the owner email in Swedish and the customer copy in the customer's language", async () => {
    sendMock.mockResolvedValue(OK);
    await sendRequestEmails(parseRequest({ ...rawBusiness, locale: "en" }));
    const [owner, customer] = sendMock.mock.calls.map(([payload]) => payload);

    expect(owner.subject).toBe("Ny förfrågan: Företag (Gym) – Gym & Co AB");
    expect(customer.subject).toBe("We have received your request – WeDo365");
    for (const email of [owner, customer]) {
      expect(email.html).toContain("<html");
      expect(email.text.length).toBeGreaterThan(0);
    }
  });

  describe("when sending fails", () => {
    it("fails the request if the owner email is rejected, and sends no customer copy", async () => {
      sendMock.mockResolvedValueOnce(FAIL);
      const result = await sendRequestEmails(parseRequest(rawHome));

      expect(result).toEqual({ ok: false, reason: "owner_failed" });
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it("fails the request if sending the owner email throws", async () => {
      sendMock.mockRejectedValueOnce(new Error("network down"));
      const result = await sendRequestEmails(parseRequest(rawHome));

      expect(result).toEqual({ ok: false, reason: "owner_failed" });
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it("still counts the request as received if only the customer copy fails", async () => {
      sendMock.mockResolvedValueOnce(OK).mockResolvedValueOnce(FAIL);
      const result = await sendRequestEmails(parseRequest(rawHome));

      expect(result).toEqual({ ok: true, customerSent: false });
      expect(sendMock).toHaveBeenCalledTimes(2);
    });

    it("also survives the customer copy throwing", async () => {
      sendMock
        .mockResolvedValueOnce(OK)
        .mockRejectedValueOnce(new Error("network down"));
      const result = await sendRequestEmails(parseRequest(rawHome));

      expect(result).toEqual({ ok: true, customerSent: false });
    });

    it("never writes form contents to the log", async () => {
      sendMock.mockResolvedValueOnce(FAIL);
      await sendRequestEmails(parseRequest(rawHome));
      sendMock.mockResolvedValueOnce(OK).mockResolvedValueOnce(FAIL);
      await sendRequestEmails(parseRequest(rawHome));
      sendMock.mockRejectedValueOnce(new Error("anna@example.se Storgatan 1"));
      await sendRequestEmails(parseRequest(rawHome));

      expect(errorLog).toHaveBeenCalled();
      const log = logged();
      for (const secret of [
        "anna@example.se",
        "Anna",
        "Storgatan",
        "0701234567",
        "Portkod",
      ]) {
        expect(log).not.toContain(secret);
      }
    });
  });

  describe("when email is not configured", () => {
    it.each(["RESEND_API_KEY", "MAIL_FROM", "MAIL_TO_OWNER"])(
      "reports it, sends nothing and says which settings are needed, if %s is missing",
      async (name) => {
        vi.stubEnv(name, "");
        const result = await sendRequestEmails(parseRequest(rawHome));

        expect(result).toEqual({ ok: false, reason: "not_configured" });
        expect(sendMock).not.toHaveBeenCalled();
        expect(logged()).toContain("RESEND_API_KEY");
      },
    );
  });
});
