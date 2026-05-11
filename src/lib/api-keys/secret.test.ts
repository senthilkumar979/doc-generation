import { describe, expect, it } from "vitest";

import {
  API_KEY_PREFIX_DISPLAY_LEN,
  buildApiKeyPlaintext,
  formatApiKeyPrefix,
  hashApiKeySecret,
} from "./secret";

describe("api-keys secret helpers", () => {
  it("returns 64-char hex sha256 hash", () => {
    expect(hashApiKeySecret("hello")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("truncates long keys to display length", () => {
    const long = "docr_live_" + "x".repeat(100);
    expect(formatApiKeyPrefix(long)).toHaveLength(API_KEY_PREFIX_DISPLAY_LEN);
  });

  it("returns full string when already short", () => {
    const short = "docr_live_xx";
    expect(formatApiKeyPrefix(short)).toBe(short);
  });

  it("buildApiKeyPlaintext includes prefix and non-trivial suffix", () => {
    const plaintext = buildApiKeyPlaintext();
    expect(plaintext.startsWith("docr_live_")).toBe(true);
    expect(plaintext.length).toBeGreaterThan("docr_live_".length + 16);
    expect(formatApiKeyPrefix(plaintext).length).toBe(API_KEY_PREFIX_DISPLAY_LEN);
  });
});
