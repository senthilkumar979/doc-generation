"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createServerSupabase } from "@/lib/supabase/server";

const nameSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export interface ActionResult {
  error?: string;
  ok?: true;
}

export async function createOrganizationAction(
  _prev: ActionResult | void,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = nameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: "Enter an organization name (2–120 characters)." };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: parsed.data.name, owner_id: user.id })
    .select("id")
    .single();

  if (orgError) return { error: orgError.message };

  const { error: memberError } = await supabase.from("organization_members").insert({
    org_id: org.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) return { error: memberError.message };

  revalidatePath("/dashboard");
  return { ok: true };
}
