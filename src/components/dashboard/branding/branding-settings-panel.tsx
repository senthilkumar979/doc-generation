"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { deleteOrgBrandImageAction } from "@/actions/upsert-org-brand-image";
import { removeOrgBrandCoreMediaAction } from "@/actions/upsert-org-brand-profile";
import { type OrgBrandAddressRow, type OrgBrandImageRow, type OrgBrandProfileRow, rowToFormValues } from "@/lib/branding/org-brand-schema";
import { notify } from "@/lib/toast";

import { BrandingAddressPanel } from "./branding-address-panel";
import { BrandingEditDialog } from "./branding-edit-dialog";
import { BrandingImagesDrawer } from "./branding-images-drawer";
import { BrandingMediaDrawer } from "./branding-media-drawer";
import type { BrandingSectionRow } from "./branding-section-card";
import { BrandingSectionCard } from "./branding-section-card";

interface BrandingSettingsPanelProps {
  profile: OrgBrandProfileRow | null;
  addresses: OrgBrandAddressRow[];
  images: OrgBrandImageRow[];
}

export function BrandingSettingsPanel({ profile, addresses, images }: BrandingSettingsPanelProps) {
  const router = useRouter();
  const values = useMemo(() => rowToFormValues(profile), [profile]);
  const [openSection, setOpenSection] = useState<"identity" | "colors" | "media" | "images" | null>(null);

  async function removeCoreMediaSlot(slot: "logo" | "icon") {
    const fd = new FormData();
    fd.set("slot", slot);
    const result = await removeOrgBrandCoreMediaAction(undefined, fd);
    if ("error" in result) {
      notify.error("Could not remove image", { description: result.error });
      return;
    }
    notify.success(slot === "logo" ? "Logo removed" : "Icon removed");
    router.refresh();
  }

  async function removeFirstAdditionalImage() {
    const first = images[0];
    if (!first?.id) return;
    const fd = new FormData();
    fd.set("id", first.id);
    const result = await deleteOrgBrandImageAction(undefined, fd);
    if ("error" in result) {
      notify.error("Could not remove image", { description: result.error });
      return;
    }
    notify.success("Image removed");
    router.refresh();
  }

  const coreMediaRows: BrandingSectionRow[] =
    values.logoUrl || values.iconUrl
      ? [
          {
            label: "Logo",
            value: values.logoUrl ?? null,
            ...(values.logoUrl?.trim()
              ? { onRemove: () => removeCoreMediaSlot("logo") }
              : {}),
          },
          {
            label: "Icon",
            value: values.iconUrl ?? null,
            ...(values.iconUrl?.trim()
              ? { onRemove: () => removeCoreMediaSlot("icon") }
              : {}),
          },
        ]
      : [];

  const additionalImageRows: BrandingSectionRow[] =
    images.length > 0
      ? [
          {
            label: images[0]?.label?.trim()
              ? String(images[0].label)
              : "Untitled image",
            value: images[0]?.image_url ?? null,
            ...(images[0]?.image_url?.trim()
              ? { onRemove: removeFirstAdditionalImage }
              : {}),
          },
        ]
      : [];

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
        <BrandingAddressPanel addresses={addresses} />
        <BrandingSectionCard
          title="Core media"
          isImageCard={true}
          description="Logo and icon used in nav, templates, and exports."
          rows={coreMediaRows}
          emptyText="No media added yet"
          onEdit={() => setOpenSection("media")}
        />
        <BrandingSectionCard
          title="Additional images"
          description="Extra visual assets like hero, banner, cover, etc."
          isImageCard={true}
          rows={additionalImageRows}
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
