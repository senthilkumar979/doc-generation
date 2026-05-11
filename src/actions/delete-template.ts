"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { createServerSupabase } from "@/lib/supabase/server";

import type { TemplateActionResult } from "./create-template";

const idSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteTemplateAction(
  _prev: TemplateActionResult | undefined,
  formData: FormData,
): Promise<TemplateActionResult> {
  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "Invalid template." };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const orgId = await fetchFirstOrgIdForUser(supabase, user.id);
  if (!orgId) return { error: "Create an organization first." };

  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", parsed.data.id)
    .eq("org_id", orgId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/templates");
  return { ok: true };
}
