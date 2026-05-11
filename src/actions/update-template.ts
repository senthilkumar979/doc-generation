"use server";

import { revalidatePath } from "next/cache";

import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { parseTemplatePayload } from "@/lib/templates/payload-schema";
import { parseUpdateTemplateForm } from "@/lib/templates/template-form-parse";
import { createServerSupabase } from "@/lib/supabase/server";

import type { TemplateActionResult } from "./create-template";

export async function updateTemplateAction(
  _prev: TemplateActionResult | undefined,
  formData: FormData,
): Promise<TemplateActionResult> {
  const parsedForm = parseUpdateTemplateForm(formData);
  if (!parsedForm.ok) return { error: parsedForm.error };

  const parsedPayload = parseTemplatePayload(
    parsedForm.value.template_type,
    parsedForm.value.rawPayload,
  );
  if (!parsedPayload.ok) return { error: parsedPayload.error };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const orgId = await fetchFirstOrgIdForUser(supabase, user.id);
  if (!orgId) return { error: "Create an organization first." };

  const { data: existing, error: readError } = await supabase
    .from("templates")
    .select("id,org_id")
    .eq("id", parsedForm.value.id)
    .maybeSingle();

  if (readError) return { error: readError.message };
  if (!existing || existing.org_id !== orgId) return { error: "Template not found." };

  const { error } = await supabase
    .from("templates")
    .update({
      name: parsedForm.value.name,
      payload: parsedPayload.payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsedForm.value.id)
    .eq("org_id", orgId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/templates");
  return { ok: true };
}
