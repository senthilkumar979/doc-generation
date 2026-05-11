import type { SupabaseClient } from "@supabase/supabase-js";

import { hashApiKeySecret, formatApiKeyPrefix } from "@/lib/api-keys/secret";

import { timingSafeSha256HexEqual } from "./crypto-sha256-hex-equal";

export interface VerifiedApiKey {
  apiKeyId: string;
  orgId: string;
}

/** Resolves plaintext API secrets against `api_keys` using the caller-provided Supabase client (typically service_role). */
export async function verifyPlaintextApiKey(
  supabase: SupabaseClient,
  plaintextSecret: string,
): Promise<VerifiedApiKey | null> {
  const digest = hashApiKeySecret(plaintextSecret);
  const prefix = formatApiKeyPrefix(plaintextSecret);

  const { data: rows } = await supabase
    .from("api_keys")
    .select("id, org_id, secret_hash")
    .eq("key_prefix", prefix)
    .is("revoked_at", null);

  if (!rows?.length) return null;

  for (const row of rows) {
    const idOk = typeof row.id === "string" && typeof row.org_id === "string";
    const hashOk = typeof row.secret_hash === "string";
    if (!idOk || !hashOk || !timingSafeSha256HexEqual(digest, row.secret_hash)) continue;

    return { apiKeyId: row.id, orgId: row.org_id };
  }

  return null;
}
