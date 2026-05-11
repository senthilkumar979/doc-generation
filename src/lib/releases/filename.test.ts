import { describe, expect, it } from "vitest";
import { parseSlugFromReleaseFilename } from "./filename";

describe("parseSlugFromReleaseFilename", () => {
  it("parses valid release filenames", () => {
    expect(parseSlugFromReleaseFilename("v0.0.0.md")).toBe("0.0.0");
    expect(parseSlugFromReleaseFilename("v1.2.3.md")).toBe("1.2.3");
  });

  it("returns null for invalid names", () => {
    expect(parseSlugFromReleaseFilename("CHANGELOG.md")).toBeNull();
    expect(parseSlugFromReleaseFilename("v1.md")).toBeNull();
  });
});
