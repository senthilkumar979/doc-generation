import { describe, expect, it } from "vitest";

import { parseCreateTemplateForm, parseUpdateTemplateForm } from "./template-form-parse";

describe("parseCreateTemplateForm", () => {
  it("rejects blank name", () => {
    const fd = new FormData();
    fd.set("name", "");
    fd.set("template_type", "blank");
    const r = parseCreateTemplateForm(fd);
    expect(r.ok).toBe(false);
  });

  it("parses blank template", () => {
    const fd = new FormData();
    fd.set("name", "Empty");
    fd.set("template_type", "blank");
    expect(parseCreateTemplateForm(fd)).toEqual({
      ok: true,
      value: { name: "Empty", template_type: "blank", rawPayload: {} },
    });
  });

  it("requires letter subject and content", () => {
    const fd = new FormData();
    fd.set("name", "Welcome");
    fd.set("template_type", "letter");
    fd.set("subject", "");
    fd.set("content", "Body");
    expect(parseCreateTemplateForm(fd).ok).toBe(false);
  });

  it("parses letter template fields", () => {
    const fd = new FormData();
    fd.set("name", "Welcome");
    fd.set("template_type", "letter");
    fd.set("subject", "Subj");
    fd.set("content", "Long body");
    expect(parseCreateTemplateForm(fd)).toEqual({
      ok: true,
      value: {
        name: "Welcome",
        template_type: "letter",
        rawPayload: { subject: "Subj", content: "Long body" },
      },
    });
  });

  it("rejects unknown type", () => {
    const fd = new FormData();
    fd.set("name", "X");
    fd.set("template_type", "bogus");
    expect(parseCreateTemplateForm(fd).ok).toBe(false);
  });
});

describe("parseUpdateTemplateForm", () => {
  it("returns create errors for invalid letter bodies", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    const fd = new FormData();
    fd.set("id", id);
    fd.set("name", "Broken");
    fd.set("template_type", "letter");
    fd.set("subject", "S");
    fd.set("content", "");
    expect(parseUpdateTemplateForm(fd).ok).toBe(false);
  });

  it("includes id when valid", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    const fd = new FormData();
    fd.set("id", id);
    fd.set("name", "N");
    fd.set("template_type", "blank");
    expect(parseUpdateTemplateForm(fd)).toMatchObject({
      ok: true,
      value: { id, template_type: "blank" },
    });
  });

  it("rejects malformed id", () => {
    const fd = new FormData();
    fd.set("id", "bad");
    fd.set("name", "N");
    fd.set("template_type", "blank");
    expect(parseUpdateTemplateForm(fd).ok).toBe(false);
  });
});
