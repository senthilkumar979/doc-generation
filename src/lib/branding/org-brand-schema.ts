import { z } from "zod";

const short = z.string().max(200);
const long = z.string().max(2000);
const urlLike = z
  .string()
  .max(2000)
  .refine((v) => v.trim() === "" || z.string().url().safeParse(v.trim()).success, "Invalid URL.");
const emailLike = z
  .string()
  .max(320)
  .refine((v) => v.trim() === "" || z.string().email().safeParse(v.trim()).success, "Invalid email.");
const hexLike = z
  .string()
  .max(16)
  .refine((v) => v.trim() === "" || /^#[0-9A-Fa-f]{6}$/.test(v.trim()), "Use hex like #2563eb.");

export const orgBrandProfileFormSchema = z.object({
  companyName: short,
  legalName: short,
  tagline: long,
  websiteUrl: urlLike,
  supportEmail: emailLike,
  primaryColor: hexLike,
  secondaryColor: hexLike,
  accentColor: hexLike,
  logoUrl: urlLike,
  iconUrl: urlLike,
});

export type OrgBrandProfileFormValues = z.infer<typeof orgBrandProfileFormSchema>;

export interface OrgBrandProfileRow {
  id: string;
  org_id: string;
  company_name: string | null;
  legal_name: string | null;
  tagline: string | null;
  website_url: string | null;
  support_email: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  logo_url: string | null;
  icon_url: string | null;
  updated_at: string;
}

export interface OrgBrandAddressRow {
  id: string;
  org_id: string;
  label: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  is_primary: boolean;
  updated_at: string;
}

export interface OrgBrandImageRow {
  id: string;
  org_id: string;
  label: string | null;
  image_type: "hero" | "banner" | "cover" | "general";
  image_url: string;
  updated_at: string;
}

export const orgBrandAddressFormSchema = z.object({
  id: z.string().uuid().optional(),
  label: short,
  addressLine1: short,
  addressLine2: short,
  city: short,
  region: short,
  postalCode: short,
  country: short,
  isPrimary: z.boolean(),
});

export type OrgBrandAddressFormValues = z.infer<typeof orgBrandAddressFormSchema>;

export const orgBrandImageFormSchema = z.object({
  id: z.string().uuid().optional(),
  label: short,
  imageType: z.enum(["hero", "banner", "cover", "general"]),
  /** Optional legacy URL; new uploads use a file instead. */
  imageUrl: urlLike.optional(),
});

export type OrgBrandImageFormValues = z.infer<typeof orgBrandImageFormSchema>;

export function rowToFormValues(row: OrgBrandProfileRow | null): OrgBrandProfileFormValues {
  if (!row) return emptyFormValues();
  return {
    companyName: row.company_name ?? "",
    legalName: row.legal_name ?? "",
    tagline: row.tagline ?? "",
    websiteUrl: row.website_url ?? "",
    supportEmail: row.support_email ?? "",
    primaryColor: row.primary_color ?? "",
    secondaryColor: row.secondary_color ?? "",
    accentColor: row.accent_color ?? "",
    logoUrl: row.logo_url ?? "",
    iconUrl: row.icon_url ?? "",
  };
}

export function emptyFormValues(): OrgBrandProfileFormValues {
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

export function formValuesToDbPatch(values: OrgBrandProfileFormValues): Record<string, string | null> {
  const v = orgBrandProfileFormSchema.parse(values);
  const nz = (s: string) => (s.trim() === "" ? null : s.trim());
  return {
    company_name: nz(v.companyName),
    legal_name: nz(v.legalName),
    tagline: nz(v.tagline),
    website_url: nz(v.websiteUrl),
    support_email: nz(v.supportEmail),
    primary_color: nz(v.primaryColor),
    secondary_color: nz(v.secondaryColor),
    accent_color: nz(v.accentColor),
    logo_url: nz(v.logoUrl),
    icon_url: nz(v.iconUrl),
  };
}

export function addressRowToFormValues(row: OrgBrandAddressRow): OrgBrandAddressFormValues {
  return {
    id: row.id,
    label: row.label ?? "",
    addressLine1: row.address_line1 ?? "",
    addressLine2: row.address_line2 ?? "",
    city: row.city ?? "",
    region: row.region ?? "",
    postalCode: row.postal_code ?? "",
    country: row.country ?? "",
    isPrimary: row.is_primary,
  };
}

export function imageRowToFormValues(row: OrgBrandImageRow): OrgBrandImageFormValues {
  return {
    id: row.id,
    label: row.label ?? "",
    imageType: row.image_type,
    imageUrl: row.image_url,
  };
}
