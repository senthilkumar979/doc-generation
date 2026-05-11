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
});
