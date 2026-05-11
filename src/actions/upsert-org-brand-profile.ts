"use server";

import { revalidatePath } from "next/cache";

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

  const patch = buildProfilePatch(section, formData);
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

function buildProfilePatch(section: BrandingSection, formData: FormData): Record<string, string | null> {
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
  if (section === "colors") {
    return {
      primary_color: normalize(str("primaryColor")),
      secondary_color: normalize(str("secondaryColor")),
      accent_color: normalize(str("accentColor")),
    };
  }
  return {
    logo_url: normalize(str("logoUrl")),
    icon_url: normalize(str("iconUrl")),
  };
}

function normalize(v: string): string | null {
  const s = v.trim();
  return s === "" ? null : s;
}
