"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { type BrandingActionResult } from "@/actions/upsert-org-brand-profile";
import { deleteStoredAssetIfOwned, replaceAdditionalBrandImage } from "@/lib/branding/brand-assets-storage";
import { pickBrandingUploadFromFormData, validateBrandImageFileForUpload } from "@/lib/branding/brand-image-accept";
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

  const imageUrlRaw = String(formData.get("imageUrl") ?? "").trim();
  const parsed = orgBrandImageFormSchema.safeParse({
    id: formData.get("id") || undefined,
    label: String(formData.get("label") ?? ""),
    imageType: String(formData.get("imageType") ?? "general"),
    imageUrl: imageUrlRaw === "" ? undefined : imageUrlRaw,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid image." };

  const file = pickBrandingUploadFromFormData(formData.get("imageFile"));
  const rowId = parsed.data.id;
  const targetId = rowId ?? randomUUID();

  let image_url: string;

  if (file) {
    const fileErr = validateBrandImageFileForUpload(file);
    if (fileErr) return { error: fileErr };
    if (rowId) {
      const { data: prev } = await scoped.supabase
        .from("org_brand_images")
        .select("image_url")
        .eq("id", rowId)
        .eq("org_id", scoped.orgId)
        .maybeSingle();
      await deleteStoredAssetIfOwned(scoped.supabase, prev?.image_url);
    }
    const uploaded = await replaceAdditionalBrandImage(scoped.supabase, scoped.orgId, targetId, file);
    if ("error" in uploaded) return { error: uploaded.error };
    image_url = uploaded.publicUrl;
  } else if (rowId) {
    const { data: prev } = await scoped.supabase
      .from("org_brand_images")
      .select("image_url")
      .eq("id", rowId)
      .eq("org_id", scoped.orgId)
      .maybeSingle();
    if (!prev?.image_url) return { error: "Image not found." };
    image_url = prev.image_url;
  } else {
    return { error: "Choose an image file to upload." };
  }

  const payload = {
    org_id: scoped.orgId,
    label: normalize(parsed.data.label),
    image_type: parsed.data.imageType,
    image_url,
    updated_at: new Date().toISOString(),
  };

  const query = rowId
    ? scoped.supabase.from("org_brand_images").update(payload).eq("id", rowId).eq("org_id", scoped.orgId)
    : scoped.supabase.from("org_brand_images").insert({ id: targetId, ...payload });

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

  const { data: row } = await scoped.supabase
    .from("org_brand_images")
    .select("image_url")
    .eq("id", id)
    .eq("org_id", scoped.orgId)
    .maybeSingle();

  await deleteStoredAssetIfOwned(scoped.supabase, row?.image_url);

  const { error } = await scoped.supabase.from("org_brand_images").delete().eq("id", id).eq("org_id", scoped.orgId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings/branding");
  return { ok: true };
}
