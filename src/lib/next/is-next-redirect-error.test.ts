import { describe, expect, it } from "vitest";
import { isNextRedirectError } from "./is-next-redirect-error";

describe("isNextRedirectError", () => {
  it("returns true for redirect digest shape", () => {
    expect(isNextRedirectError({ digest: "NEXT_REDIRECT;replace;/x" })).toBe(true);
  });

  it("returns false for normal errors", () => {
    expect(isNextRedirectError(new Error("fail"))).toBe(false);
    expect(isNextRedirectError(null)).toBe(false);
  });
});
