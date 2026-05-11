"use server";

import { revalidatePath } from "next/cache";

import { type BrandingActionResult } from "@/actions/upsert-org-brand-profile";
import { orgBrandImageFormSchema } from "@/lib/branding/org-brand-schema";
import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { createServerSupabase } from "@/lib/supabase/server";

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

function normalize(v: string): string | null {
  const s = v.trim();
  return s === "" ? null : s;
}

export async function upsertOrgBrandImageAction(
  _prev: BrandingActionResult | undefined,
  formData: FormData,
): Promise<BrandingActionResult> {
  const scoped = await getScopedContext();
  if ("error" in scoped) return { error: scoped.error ?? "Unable to resolve organization." };

  const parsed = orgBrandImageFormSchema.safeParse({
    id: formData.get("id") || undefined,
    label: String(formData.get("label") ?? ""),
    imageType: String(formData.get("imageType") ?? "general"),
    imageUrl: String(formData.get("imageUrl") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid image." };

  const payload = {
    org_id: scoped.orgId,
    label: normalize(parsed.data.label),
    image_type: parsed.data.imageType,
    image_url: parsed.data.imageUrl.trim(),
    updated_at: new Date().toISOString(),
  };

  const query = parsed.data.id
    ? scoped.supabase.from("org_brand_images").update(payload).eq("id", parsed.data.id).eq("org_id", scoped.orgId)
    : scoped.supabase.from("org_brand_images").insert(payload);

  const { error } = await query;
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings/branding");
  return { ok: true };
}

export async function deleteOrgBrandImageAction(
  _prev: BrandingActionResult | undefined,
  formData: FormData,
): Promise<BrandingActionResult> {
  const scoped = await getScopedContext();
  if ("error" in scoped) return { error: scoped.error ?? "Unable to resolve organization." };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Image id is required." };
  const { error } = await scoped.supabase.from("org_brand_images").delete().eq("id", id).eq("org_id", scoped.orgId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings/branding");
  return { ok: true };
}
