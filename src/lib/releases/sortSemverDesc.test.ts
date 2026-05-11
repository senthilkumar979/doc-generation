import { describe, expect, it } from "vitest";
import { compareSemverDesc } from "./sortSemverDesc";

describe("compareSemverDesc", () => {
  it("orders newer versions first", () => {
    expect(compareSemverDesc("0.1.0", "0.0.9")).toBeLessThan(0);
    expect(compareSemverDesc("0.0.0", "0.0.1")).toBeGreaterThan(0);
  });

  it("treats equal versions as equal", () => {
    expect(compareSemverDesc("1.2.3", "1.2.3")).toBe(0);
  });

  it("pads missing numeric segments as zero", () => {
    expect(compareSemverDesc("2.0", "1.9.9")).toBeLessThan(0);
    expect(compareSemverDesc("1.0", "1.0.1")).toBeGreaterThan(0);
    expect(compareSemverDesc("1.0.0", "1.0")).toBe(0);
    expect(compareSemverDesc("1.0.1", "1.0")).toBeLessThan(0);
  });
});
