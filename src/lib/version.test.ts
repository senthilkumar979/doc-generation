import { describe, expect, it } from "vitest";
import { getAppVersion } from "./version";

describe("getAppVersion", () => {
  it("returns a semver-like string", () => {
    expect(getAppVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });
});
