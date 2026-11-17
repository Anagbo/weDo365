import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HoneypotField } from "./useSpamGuard";

describe("honeypot field markup", () => {
  const html = renderToStaticMarkup(createElement(HoneypotField));

  it("is hidden from assistive technology and unreachable by keyboard", () => {
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("inert");
    expect(html).toContain('tabindex="-1"');
  });

  it("asks browsers and password managers not to autofill it", () => {
    // HTML attribute names are case-insensitive, so React's spelling is fine.
    expect(html.toLowerCase()).toContain('autocomplete="off"');
    expect(html).toContain("data-1p-ignore");
    expect(html).toContain('data-lpignore="true"');
  });

  it("sits off-screen and keeps the name the server checks", () => {
    expect(html).toContain("-left-[10000px]");
    expect(html).toContain('name="website"');
  });
});
