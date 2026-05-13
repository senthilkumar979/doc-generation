"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Template } from "@/types/template";

export async function updateBuilderTemplateAction(templateId: string, template: Template): Promise<{ error?: string; ok?: boolean }> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = await fetchFirstOrgIdForUser(supabase, user.id);
  if (!orgId) redirect("/onboarding/organization");

  const { data: existing, error: readError } = await supabase
    .from("templates")
    .select("version")
    .eq("id", templateId)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .maybeSingle();

  if (readError) return { error: readError.message };
  if (!existing) return { error: "Template not found." };

  const { error } = await supabase
    .from("templates")
    .update({
      name: template.name,
      description: template.description || null,
      page_size: template.pageSize,
      orientation: template.orientation,
      schema: template,
      version: existing.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)
    .eq("org_id", orgId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/templates");
  return { ok: true };
}
