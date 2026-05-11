import { describe, expect, it } from "vitest";

import { extractBearerToken } from "./extract-bearer-token";

describe("extractBearerToken", () => {
  it("parses Bearer token", () => {
    const req = new Request("https://example.com/", {
      headers: { Authorization: "Bearer abc.def" },
    });
    expect(extractBearerToken(req)).toBe("abc.def");
  });

  it("returns null without header", () => {
    const req = new Request("https://example.com/");
    expect(extractBearerToken(req)).toBeNull();
  });
});
