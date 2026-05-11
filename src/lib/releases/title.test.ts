import { describe, expect, it } from "vitest";
import { extractTitleFromMarkdown } from "./title";

describe("extractTitleFromMarkdown", () => {
  it("reads leading H1", () => {
    expect(extractTitleFromMarkdown("# Hello\n\nBody")).toBe("Hello");
  });

  it("falls back when no H1", () => {
    expect(extractTitleFromMarkdown("no header")).toBe("Release");
  });

  it("falls back when H1 has no visible title", () => {
    expect(extractTitleFromMarkdown("#   \nbody")).toBe("Release");
  });

  it("handles empty input", () => {
    expect(extractTitleFromMarkdown("")).toBe("Release");
  });
});
