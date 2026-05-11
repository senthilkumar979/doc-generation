"use client";

import { useMemo, useState } from "react";

import { type OrgBrandAddressRow, type OrgBrandImageRow, type OrgBrandProfileRow, rowToFormValues } from "@/lib/branding/org-brand-schema";

import { BrandingAddressesDialog } from "./branding-addresses-dialog";
import { BrandingEditDialog } from "./branding-edit-dialog";
import { BrandingImagesDrawer } from "./branding-images-drawer";
import { BrandingMediaDrawer } from "./branding-media-drawer";
import { BrandingSectionCard } from "./branding-section-card";

interface BrandingSettingsPanelProps {
  profile: OrgBrandProfileRow | null;
  addresses: OrgBrandAddressRow[];
  images: OrgBrandImageRow[];
}

export function BrandingSettingsPanel({ profile, addresses, images }: BrandingSettingsPanelProps) {
  const values = useMemo(() => rowToFormValues(profile), [profile]);
  const [openSection, setOpenSection] = useState<"identity" | "colors" | "addresses" | "media" | "images" | null>(null);

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <BrandingSectionCard
          title="Identity"
          description="Company name, legal name, and tagline used in docs."
          rows={[
            { label: "Company", value: values.companyName },
            { label: "Legal", value: values.legalName },
            { label: "Tagline", value: values.tagline },
            { label: "Website", value: values.websiteUrl },
            { label: "Support", value: values.supportEmail },
          ]}
          onEdit={() => setOpenSection("identity")}
        />
        <BrandingSectionCard
          title="Brand colors"
          description="Primary palette for templates and generated assets."
          rows={[
            { label: "Primary", value: values.primaryColor },
            { label: "Secondary", value: values.secondaryColor },
            { label: "Accent", value: values.accentColor },
          ]}
          onEdit={() => setOpenSection("colors")}
        />
        <div className="col-span-2">
        <BrandingSectionCard
          title="Addresses"
          description="Multiple postal addresses for invoices, legal docs, and regional operations."
            rows={ addresses?.map((a) => ({
              label: a.label ?? "New Address",
              value: [a.address_line1, a.city, a.country].filter(Boolean).join(", "),
            })) ?? []}
            emptyText="No addresses added yet"
            onEdit={() => setOpenSection("addresses")}
          />
        </div>
        <BrandingSectionCard
          title="Core media"
          description="Logo and icon used in nav, templates, and exports."
          rows={values.logoUrl || values.iconUrl ? [
              { label: "Logo", value: values.logoUrl },
              { label: "Icon", value: values.iconUrl },
            ]
          : []}
          emptyText="No media added yet"
          onEdit={() => setOpenSection("media")}
        />
        <BrandingSectionCard
          title="Additional images"
          description="Extra visual assets like hero, banner, cover, etc."
          rows={images.length > 0 ? [
              { label: images[0]?.label ?? "Untitled image", value: images[0]?.image_url ?? null },
            ]
          : []}
          emptyText="No images added yet"
          onEdit={() => setOpenSection("images")}
        />
      </div>

      <BrandingEditDialog
        open={openSection === "identity"}
        onOpenChange={(open) => setOpenSection(open ? "identity" : null)}
        title="Edit identity"
        description="Used in cover pages, legal references, and customer headers."
        section="identity"
        values={values}
        fields={[
          { name: "companyName", label: "Company name" },
          { name: "legalName", label: "Legal name" },
          { name: "tagline", label: "Tagline", multiline: true },
          { name: "websiteUrl", label: "Website URL", type: "url" },
          { name: "supportEmail", label: "Support email", type: "email" },
        ]}
      />
      <BrandingEditDialog
        open={openSection === "colors"}
        onOpenChange={(open) => setOpenSection(open ? "colors" : null)}
        title="Edit brand colors"
        description="Use 6-digit hex values (example: #2563eb)."
        section="colors"
        values={values}
        fields={[
          { name: "primaryColor", label: "Primary color" },
          { name: "secondaryColor", label: "Secondary color" },
          { name: "accentColor", label: "Accent color" },
        ]}
      />
      <BrandingAddressesDialog
        open={openSection === "addresses"}
        onOpenChange={(open) => setOpenSection(open ? "addresses" : null)}
        addresses={addresses}
      />
      <BrandingMediaDrawer
        open={openSection === "media"}
        onOpenChange={(open) => setOpenSection(open ? "media" : null)}
        values={{
          logoUrl: values.logoUrl,
          iconUrl: values.iconUrl,
        }}
      />
      <BrandingImagesDrawer
        open={openSection === "images"}
        onOpenChange={(open) => setOpenSection(open ? "images" : null)}
        images={images}
      />
    </>
  );
}
