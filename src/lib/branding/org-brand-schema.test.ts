import { describe, expect, it } from "vitest";

import type { OrgBrandAddressRow, OrgBrandImageRow, OrgBrandProfileRow } from "@/lib/branding/org-brand-schema";
import {
  addressRowToFormValues,
  emptyFormValues,
  formValuesToDbPatch,
  imageRowToFormValues,
  orgBrandAddressFormSchema,
  orgBrandImageFormSchema,
  orgBrandProfileFormSchema,
  rowToFormValues,
} from "@/lib/branding/org-brand-schema";

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

  it("accepts optional id and a valid absolute URL", () => {
    const parsed = orgBrandImageFormSchema.parse({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      label: "Banner",
      imageType: "banner",
      imageUrl: " https://cdn.example/img.png ",
    });
    expect(parsed.imageUrl).toContain("cdn.example");
  });
});

describe("orgBrandAddressFormSchema", () => {
  it("parses checkbox-backed boolean", () => {
    const parsed = orgBrandAddressFormSchema.parse({
      label: "HQ",
      addressLine1: "1 Main St",
      addressLine2: "",
      city: "NYC",
      region: "NY",
      postalCode: "10001",
      country: "US",
      isPrimary: true,
    });
    expect(parsed.isPrimary).toBe(true);
  });

  it("rejects fields above the short text limit", () => {
    const tooLong = "x".repeat(201);
    expect(() =>
      orgBrandAddressFormSchema.parse({
        label: tooLong,
        addressLine1: "1",
        addressLine2: "",
        city: "",
        region: "",
        postalCode: "",
        country: "",
        isPrimary: false,
      }),
    ).toThrow();
  });
});

describe("row mappers", () => {
  it("maps profile row ↔ form values and empty defaults when null row", () => {
    expect(emptyFormValues().companyName).toBe("");
    const row = {
      id: "r1",
      org_id: "o1",
      company_name: "Acme",
      legal_name: null,
      tagline: "Better",
      website_url: "https://acme.example",
      support_email: "hi@acme.example",
      primary_color: "#112233",
      secondary_color: null,
      accent_color: "",
      logo_url: null,
      icon_url: null,
      updated_at: "t",
    } satisfies OrgBrandProfileRow;
    const v = rowToFormValues(row);
    expect(v.companyName).toBe("Acme");
    expect(v.secondaryColor).toBe("");
    const addr = addressRowToFormValues({
      id: "addr-1",
      org_id: "o1",
      label: "HQ",
      address_line1: "1 St",
      address_line2: null,
      city: "Boston",
      region: "MA",
      postal_code: "02101",
      country: "US",
      is_primary: true,
      updated_at: "t",
    } satisfies OrgBrandAddressRow);
    expect(addr.city).toBe("Boston");

    const img = imageRowToFormValues({
      id: "im-1",
      org_id: "o1",
      label: "Hero",
      image_type: "hero",
      image_url: "https://cdn.example/x.png",
      updated_at: "t",
    } satisfies OrgBrandImageRow);
    expect(img.imageType).toBe("hero");
  });

  it("validates emails on profile schema when provided", () => {
    expect(() =>
      orgBrandProfileFormSchema.parse({
        ...minimalValid(),
        supportEmail: "not-valid",
      }),
    ).toThrow(/Invalid email/i);
  });

  it("accepts non-empty valid URLs and emails on the profile schema", () => {
    const parsed = orgBrandProfileFormSchema.parse({
      ...minimalValid(),
      websiteUrl: "https://valid.example",
      supportEmail: "team@valid.example",
      logoUrl: "https://files.example/logo.png",
    });
    expect(parsed.websiteUrl).toBe("https://valid.example");
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
