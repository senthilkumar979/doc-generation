// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { isInternalRouteChangeClick } from "@/lib/navigation/internal-link-click";

function anchor(href: string) {
  const el = document.createElement("a");
  el.setAttribute("href", href);
  return el;
}

describe("isInternalRouteChangeClick", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true for a same-origin path change", () => {
    vi.stubGlobal("location", {
      href: "https://example.org/dashboard",
      origin: "https://example.org",
      pathname: "/dashboard",
      search: "",
    } as Location);

    const a = anchor("/templates");
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    expect(isInternalRouteChangeClick(a, ev)).toBe(true);
  });

  it("returns false when modifier key is held", () => {
    vi.stubGlobal("location", {
      href: "https://example.org/dashboard",
      origin: "https://example.org",
      pathname: "/dashboard",
      search: "",
    } as Location);

    const a = anchor("/templates");
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, metaKey: true });
    expect(isInternalRouteChangeClick(a, ev)).toBe(false);
  });

  it("returns false for same path and search", () => {
    vi.stubGlobal("location", {
      href: "https://example.org/dashboard?x=1",
      origin: "https://example.org",
      pathname: "/dashboard",
      search: "?x=1",
    } as Location);

    const a = anchor("/dashboard?x=1");
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    expect(isInternalRouteChangeClick(a, ev)).toBe(false);
  });

  it("returns false for mailto, tel, and javascript schemes", () => {
    vi.stubGlobal("location", {
      href: "https://example.org/dashboard",
      origin: "https://example.org",
      pathname: "/dashboard",
      search: "",
    } as Location);

    const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    expect(isInternalRouteChangeClick(anchor("mailto:a@b.co"), ev)).toBe(false);
    expect(isInternalRouteChangeClick(anchor("tel:+15551212"), ev)).toBe(false);
    expect(isInternalRouteChangeClick(anchor("javascript:void(0)"), ev)).toBe(false);
  });

  it("returns false for download links and non-default targets", () => {
    vi.stubGlobal("location", {
      href: "https://example.org/here",
      origin: "https://example.org",
      pathname: "/here",
      search: "",
    } as Location);

    const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    const dl = anchor("/file");
    dl.setAttribute("download", "");
    expect(isInternalRouteChangeClick(dl, ev)).toBe(false);

    const blank = anchor("/other");
    blank.setAttribute("target", "_blank");
    expect(isInternalRouteChangeClick(blank, ev)).toBe(false);
  });

  it("returns false unless the DOM event represents a bare primary-button click", () => {
    vi.stubGlobal("location", {
      href: "https://example.org/here",
      origin: "https://example.org",
      pathname: "/here",
      search: "",
    } as Location);

    const link = anchor("/somewhere");

    let ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    ev.preventDefault();
    expect(isInternalRouteChangeClick(link, ev)).toBe(false);

    ev = new MouseEvent("pointerdown", { bubbles: true, cancelable: true, button: 0 });
    expect(isInternalRouteChangeClick(link, ev)).toBe(false);

    ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 1 });
    expect(isInternalRouteChangeClick(link, ev)).toBe(false);
  });

  it("returns false for cross-origin hrefs", () => {
    vi.stubGlobal("location", {
      href: "https://example.org/here",
      origin: "https://example.org",
      pathname: "/here",
      search: "",
    } as Location);

    const outer = anchor("https://other.example/route");
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    expect(isInternalRouteChangeClick(outer, ev)).toBe(false);
  });

  it("returns false when resolving the href throws", () => {
    vi.stubGlobal("location", {
      href: "https://example.org/dashboard",
      origin: "https://example.org",
      pathname: "/dashboard",
      search: "",
    } as Location);

    const Original = globalThis.URL;
    vi.stubGlobal(
      "URL",
      class StubURL extends Original {
        constructor(input: string | URL, base?: string | URL | undefined) {
          if (typeof input === "string" && input === "TRIGGER_THROW") {
            throw new TypeError("invalid");
          }
          super(input, base);
        }
      } as unknown as typeof URL,
    );

    const a = anchor("TRIGGER_THROW");
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    expect(isInternalRouteChangeClick(a, ev)).toBe(false);
  });
});
