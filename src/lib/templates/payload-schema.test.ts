import { describe, expect, it } from "vitest";

import { parseTemplatePayload } from "./payload-schema";

describe("parseTemplatePayload", () => {
  it("parses blank as empty object", () => {
    const r = parseTemplatePayload("blank", {});
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.payload).toEqual({});
  });

  it("parses letter with subject and content", () => {
    const r = parseTemplatePayload("letter", {
      subject: "Hello",
      content: "World",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.payload).toMatchObject({ subject: "Hello", content: "World" });
  });

  it("rejects letter without subject", () => {
    const r = parseTemplatePayload("letter", { subject: "", content: "x" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.length).toBeGreaterThan(0);
  });

  it("accepts blank payloads when raw is null-ish", () => {
    const r = parseTemplatePayload("blank", null);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.payload).toEqual({});
  });
});
