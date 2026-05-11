import { describe, expect, it } from "vitest";
import { isAuthPagePath, isAuthRequiredPath } from "./auth-paths";

describe("isAuthRequiredPath", () => {
  it("matches dashboard and onboarding", () => {
    expect(isAuthRequiredPath("/dashboard")).toBe(true);
    expect(isAuthRequiredPath("/dashboard/foo")).toBe(true);
    expect(isAuthRequiredPath("/onboarding/org")).toBe(true);
    expect(isAuthRequiredPath("/releases")).toBe(false);
  });
});

describe("isAuthPagePath", () => {
  it("matches login and signup", () => {
    expect(isAuthPagePath("/login")).toBe(true);
    expect(isAuthPagePath("/signup")).toBe(true);
    expect(isAuthPagePath("/login/extra")).toBe(false);
  });
});
