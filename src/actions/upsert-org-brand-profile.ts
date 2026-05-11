"use server";

import { revalidatePath } from "next/cache";

import { replaceIcon, replaceLogo } from "@/lib/branding/brand-assets-storage";
import { pickBrandingUploadFromFormData, validateBrandImageFileForUpload } from "@/lib/branding/brand-image-accept";
import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { createServerSupabase } from "@/lib/supabase/server";

export type BrandingActionResult = { ok: true } | { error: string };

export type BrandingSection = "identity" | "colors" | "media";

async function getScopedContext() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." } as const;

  const orgId = await fetchFirstOrgIdForUser(supabase, user.id);
  if (!orgId) return { error: "Create an organization first." } as const;

  return { supabase, orgId } as const;
}

export async function upsertOrgBrandProfileSectionAction(
  _prev: BrandingActionResult | undefined,
  formData: FormData,
): Promise<BrandingActionResult> {
  const scoped = await getScopedContext();
  if ("error" in scoped) return { error: scoped.error ?? "Unable to resolve organization." };

  const section = formData.get("section");
  if (section !== "identity" && section !== "colors" && section !== "media") {
    return { error: "Invalid section." };
  }

  let patch: Record<string, string | null>;
  if (section === "media") {
    const mediaPatch = await buildMediaPatch(scoped.supabase, scoped.orgId, formData);
    if ("error" in mediaPatch) return { error: mediaPatch.error };
    patch = mediaPatch.patch;
  } else {
    patch = buildProfilePatch(section as "identity" | "colors", formData);
  }

  const now = new Date().toISOString();

  const { error: writeError } = await scoped.supabase.from("org_brand_profiles").upsert(
    {
      org_id: scoped.orgId,
      ...patch,
      updated_at: now,
    },
    { onConflict: "org_id" },
  );

  if (writeError) return { error: writeError.message };

  revalidatePath("/dashboard/settings/branding");
  return { ok: true };
}

async function buildMediaPatch(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  orgId: string,
  formData: FormData,
): Promise<{ patch: Record<string, string | null> } | { error: string }> {
  const { data: row } = await supabase
    .from("org_brand_profiles")
    .select("logo_url, icon_url")
    .eq("org_id", orgId)
    .maybeSingle();

  let logo_url = row?.logo_url ?? null;
  let icon_url = row?.icon_url ?? null;

  const logoFile = pickBrandingUploadFromFormData(formData.get("logoFile"));
  const iconFile = pickBrandingUploadFromFormData(formData.get("iconFile"));

  if (logoFile) {
    const logoErr = validateBrandImageFileForUpload(logoFile);
    if (logoErr) return { error: logoErr };
    const uploaded = await replaceLogo(supabase, orgId, logoFile);
    if ("error" in uploaded) return { error: uploaded.error };
    logo_url = uploaded.publicUrl;
  }

  if (iconFile) {
    const iconErr = validateBrandImageFileForUpload(iconFile);
    if (iconErr) return { error: iconErr };
    const uploaded = await replaceIcon(supabase, orgId, iconFile);
    if ("error" in uploaded) return { error: uploaded.error };
    icon_url = uploaded.publicUrl;
  }

  return { patch: { logo_url, icon_url } };
}

function buildProfilePatch(section: "identity" | "colors", formData: FormData): Record<string, string | null> {
  const str = (key: string) => (formData.get(key) === null ? "" : String(formData.get(key)));
  if (section === "identity") {
    return {
      company_name: normalize(str("companyName")),
      legal_name: normalize(str("legalName")),
      tagline: normalize(str("tagline")),
      website_url: normalize(str("websiteUrl")),
      support_email: normalize(str("supportEmail")),
    };
  }
  return {
    primary_color: normalize(str("primaryColor")),
    secondary_color: normalize(str("secondaryColor")),
    accent_color: normalize(str("accentColor")),
  };
}

function normalize(v: string): string | null {
  const s = v.trim();
  return s === "" ? null : s;
}
