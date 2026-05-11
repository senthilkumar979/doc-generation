import { describe, expect, it } from "vitest";

import { formValuesToDbPatch, orgBrandImageFormSchema, orgBrandProfileFormSchema } from "@/lib/branding/org-brand-schema";

describe("orgBrandProfileFormSchema", () => {
  it("accepts empty strings and maps to null in db patch", () => {
    const parsed = orgBrandProfileFormSchema.parse(minimalValid());
    const patch = formValuesToDbPatch(parsed);
    expect(patch.company_name).toBeNull();
    expect(patch.primary_color).toBeNull();
  });

  it("validates hex colors when provided", () => {
    expect(() =>
      orgBrandProfileFormSchema.parse({
        ...minimalValid(),
        primaryColor: "blue",
      }),
    ).toThrow();
  });

  it("validates urls when provided", () => {
    expect(() =>
      orgBrandProfileFormSchema.parse({
        ...minimalValid(),
        logoUrl: "not-a-url",
      }),
    ).toThrow();
  });
});

describe("orgBrandImageFormSchema", () => {
  it("requires image URL", () => {
    expect(() =>
      orgBrandImageFormSchema.parse({
        label: "Homepage hero",
        imageType: "hero",
        imageUrl: "",
      }),
    ).toThrow();
  });
});

function minimalValid() {
  return {
    companyName: "",
    legalName: "",
    tagline: "",
    websiteUrl: "",
    supportEmail: "",
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
    logoUrl: "",
    iconUrl: "",
  };
}
