"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { buildApiKeyPlaintext, formatApiKeyPrefix, hashApiKeySecret } from "@/lib/api-keys/secret";
import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { createServerSupabase } from "@/lib/supabase/server";

const nameSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export interface CreateApiKeyResult {
  error?: string;
  revealed?: { id: string; plaintext: string; name: string };
}

export async function createApiKeyAction(
  _prev: CreateApiKeyResult | undefined,
  formData: FormData,
): Promise<CreateApiKeyResult> {
  const parsed = nameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: "Enter a label (1–80 characters)." };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const orgId = await fetchFirstOrgIdForUser(supabase, user.id);
  if (!orgId) return { error: "Create an organization first." };

  const plaintext = buildApiKeyPlaintext();
  const keyPrefix = formatApiKeyPrefix(plaintext);
  const secretHash = hashApiKeySecret(plaintext);

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      org_id: orgId,
      name: parsed.data.name,
      key_prefix: keyPrefix,
      secret_hash: secretHash,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings/api-keys");
  return {
    revealed: { id: data.id, plaintext, name: parsed.data.name },
  };
}
