import type { SupabaseClient } from "@supabase/supabase-js";

import { createServiceRoleClient } from "@/lib/supabase/service-role";

import { extractBearerToken } from "./extract-bearer-token";
import { jsonServiceUnavailable, jsonUnauthorized } from "./http";
import { verifyPlaintextApiKey } from "./verify-plaintext-api-key";

export interface AuthorizedApiCaller {
  supabase: SupabaseClient;
  orgId: string;
  apiKeyId: string;
}

export async function authorizeApiRequest(
  request: Request,
): Promise<AuthorizedApiCaller | Response> {
  const supabase = createServiceRoleClient();
  if (!supabase) return jsonServiceUnavailable();

  const token = extractBearerToken(request);
  if (!token) return jsonUnauthorized();

  const ctx = await verifyPlaintextApiKey(supabase, token);
  if (!ctx) return jsonUnauthorized();

  return { supabase, orgId: ctx.orgId, apiKeyId: ctx.apiKeyId };
}
