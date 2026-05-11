import { describe, expect, it } from "vitest";

import { timingSafeSha256HexEqual } from "./crypto-sha256-hex-equal";

const a =
  "2c26b46b68ffc68ff99b453c1d3041340e8108a96642a3bdf43f7d979c7e6c5c";
const bBad =
  "3c26b46b68ffc68ff99b453c1d3041340e8108a96642a3bdf43f7d979c7e6c5c";

describe("timingSafeSha256HexEqual", () => {
  it("matches equal digests case-insensitively", () => {
    expect(timingSafeSha256HexEqual(a, a.toUpperCase())).toBe(true);
  });

  it("rejects mismatched digests", () => {
    expect(timingSafeSha256HexEqual(a, bBad)).toBe(false);
  });

  it("rejects malformed strings", () => {
    expect(timingSafeSha256HexEqual(a, "not-hex")).toBe(false);
    expect(timingSafeSha256HexEqual("zzz", "zzz")).toBe(false);
  });
});
