"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createServerSupabase } from "@/lib/supabase/server";

const idSchema = z.object({
  id: z.string().uuid(),
});

export interface RevokeApiKeyResult {
  error?: string;
  ok?: boolean;
}

export async function revokeApiKeyAction(
  _prev: RevokeApiKeyResult | undefined,
  formData: FormData,
): Promise<RevokeApiKeyResult> {
  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "Invalid key." };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("api_keys")
    .update({ revoked_at: now })
    .eq("id", parsed.data.id)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Key not found or already revoked." };

  revalidatePath("/dashboard/settings/api-keys");
  return { ok: true };
}
