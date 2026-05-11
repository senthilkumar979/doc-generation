"use server";

import { revalidatePath } from "next/cache";

import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { parseTemplatePayload } from "@/lib/templates/payload-schema";
import { parseCreateTemplateForm } from "@/lib/templates/template-form-parse";
import { createServerSupabase } from "@/lib/supabase/server";

export interface TemplateActionResult {
  error?: string;
  ok?: boolean;
}

export async function createTemplateAction(
  _prev: TemplateActionResult | undefined,
  formData: FormData,
): Promise<TemplateActionResult> {
  const parsedForm = parseCreateTemplateForm(formData);
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

  const { error } = await supabase.from("templates").insert({
    org_id: orgId,
    name: parsedForm.value.name,
    template_type: parsedForm.value.template_type,
    payload: parsedPayload.payload,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/templates");
  return { ok: true };
}
