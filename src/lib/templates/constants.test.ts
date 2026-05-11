import { describe, expect, it } from "vitest";

import { isTemplateType, TEMPLATE_TYPES } from "./constants";

describe("template constants", () => {
  it("includes known types", () => {
    expect(TEMPLATE_TYPES).toContain("letter");
    expect(TEMPLATE_TYPES).toContain("blank");
  });

  it("narrows template type", () => {
    expect(isTemplateType("letter")).toBe(true);
    expect(isTemplateType("unknown")).toBe(false);
  });
});
