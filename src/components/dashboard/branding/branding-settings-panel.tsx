"use client";

import { Building2 } from "lucide-react";
import { useMemo, useState } from "react";

import { type OrgBrandAddressRow, type OrgBrandImageRow, type OrgBrandProfileRow, rowToFormValues } from "@/lib/branding/org-brand-schema";

import { BrandingAddressPanel } from "./branding-address-panel";
import { BrandingEditDialog } from "./branding-edit-dialog";
import { BrandingImagesDrawer } from "./branding-images-drawer";
import { BrandingMediaDrawer } from "./branding-media-drawer";
import { BrandingOverviewBar } from "./branding-overview-bar";
import { BrandingSectionCard } from "./branding-section-card";

interface BrandingSettingsPanelProps {
  profile: OrgBrandProfileRow | null;
  addresses: OrgBrandAddressRow[];
  images: OrgBrandImageRow[];
}

export function BrandingSettingsPanel({ profile, addresses, images }: BrandingSettingsPanelProps) {
  const values = useMemo(() => rowToFormValues(profile), [profile]);
  const [openSection, setOpenSection] = useState<"identity" | "colors" | "media" | "images" | null>(null);

  return (
    <>
      <div className="mt-10 space-y-12 lg:mt-14">
        <BrandingOverviewBar
          headline={values.companyName.trim() || "Your organization"}
          subtitle={values.tagline.trim() ? values.tagline.trim() : null}
          primaryColor={values.primaryColor.trim() ? values.primaryColor : null}
          secondaryColor={values.secondaryColor.trim() ? values.secondaryColor : null}
          accentColor={values.accentColor.trim() ? values.accentColor : null}
          logoUrl={values.logoUrl}
          iconUrl={values.iconUrl}
          icon={Building2}
        />

        <div>
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Modules</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Fine-tune identity, visuals, locations, and supporting imagery. Each block syncs to your live document stack.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
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
        <BrandingAddressPanel addresses={addresses} />
        <BrandingSectionCard
          title="Core media"
          description="Logo and icon used in nav, templates, and exports."
          rows={
            values.logoUrl || values.iconUrl
              ? [
                  { label: "Logo", value: values.logoUrl },
                  { label: "Icon", value: values.iconUrl },
                ]
              : []
          }
          emptyText="No media added yet"
          onEdit={() => setOpenSection("media")}
        />
        <BrandingSectionCard
          title="Additional images"
          description="Extra visual assets like hero, banner, cover, etc."
          rows={
            images.length > 0
              ? [
                  {
                    label: images[0]?.label?.trim() ? (images[0].label as string) : "Untitled image",
                    value: images[0]?.image_url ?? null,
                  },
                ]
              : []
          }
          emptyText="No images added yet"
          onEdit={() => setOpenSection("images")}
        />
        </div>
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
