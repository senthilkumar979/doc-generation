import { describe, expect, it } from "vitest";
import { getAuthRedirectPath } from "./redirect-for-auth";

describe("getAuthRedirectPath", () => {
  it("sends anonymous users to login for protected paths", () => {
    expect(getAuthRedirectPath("/dashboard", false)).toBe("/login?next=%2Fdashboard");
  });

  it("sends signed-in users away from auth pages", () => {
    expect(getAuthRedirectPath("/login", true)).toBe("/dashboard");
  });

  it("returns null when no redirect", () => {
    expect(getAuthRedirectPath("/releases", false)).toBeNull();
    expect(getAuthRedirectPath("/login", false)).toBeNull();
  });
});
