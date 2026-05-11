import path from "node:path";
import { describe, expect, it } from "vitest";
import { getReleaseFilePath, getReleasesDir } from "./paths";

describe("paths", () => {
  it("joins notes/releases under cwd", () => {
    expect(getReleasesDir("/app")).toBe(path.join("/app", "notes", "releases"));
  });

  it("builds versioned markdown path", () => {
    expect(getReleaseFilePath("0.0.0", "/app")).toBe(
      path.join("/app", "notes", "releases", "v0.0.0.md"),
    );
  });
});
