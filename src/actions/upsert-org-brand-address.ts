"use server";

import { revalidatePath } from "next/cache";

import { type BrandingActionResult } from "@/actions/upsert-org-brand-profile";
import { orgBrandAddressFormSchema } from "@/lib/branding/org-brand-schema";
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

export async function upsertOrgBrandAddressAction(
  _prev: BrandingActionResult | undefined,
  formData: FormData,
): Promise<BrandingActionResult> {
  const scoped = await getScopedContext();
  if ("error" in scoped) return { error: scoped.error ?? "Unable to resolve organization." };

  const parsed = orgBrandAddressFormSchema.safeParse({
    id: formData.get("id") || undefined,
    label: String(formData.get("label") ?? ""),
    addressLine1: String(formData.get("addressLine1") ?? ""),
    addressLine2: String(formData.get("addressLine2") ?? ""),
    city: String(formData.get("city") ?? ""),
    region: String(formData.get("region") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? ""),
    isPrimary: formData.get("isPrimary") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid address." };

  if (parsed.data.isPrimary) {
    const { error: clearPrimaryError } = await scoped.supabase
      .from("org_brand_addresses")
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq("org_id", scoped.orgId);
    if (clearPrimaryError) return { error: clearPrimaryError.message };
  }

  const payload = {
    org_id: scoped.orgId,
    label: normalize(parsed.data.label),
    address_line1: normalize(parsed.data.addressLine1),
    address_line2: normalize(parsed.data.addressLine2),
    city: normalize(parsed.data.city),
    region: normalize(parsed.data.region),
    postal_code: normalize(parsed.data.postalCode),
    country: normalize(parsed.data.country),
    is_primary: parsed.data.isPrimary,
    updated_at: new Date().toISOString(),
  };

  const query = parsed.data.id
    ? scoped.supabase.from("org_brand_addresses").update(payload).eq("id", parsed.data.id).eq("org_id", scoped.orgId)
    : scoped.supabase.from("org_brand_addresses").insert(payload);

  const { error } = await query;
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings/branding");
  return { ok: true };
}

export async function deleteOrgBrandAddressAction(
  _prev: BrandingActionResult | undefined,
  formData: FormData,
): Promise<BrandingActionResult> {
  const scoped = await getScopedContext();
  if ("error" in scoped) return { error: scoped.error ?? "Unable to resolve organization." };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Address id is required." };
  const { error } = await scoped.supabase.from("org_brand_addresses").delete().eq("id", id).eq("org_id", scoped.orgId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings/branding");
  return { ok: true };
}
