import type { SupabaseClient } from "@supabase/supabase-js";

export interface UsageLogPayload {
  orgId: string;
  apiKeyId: string | null;
  route: string;
  method: "GET" | "POST";
  statusCode: number;
  durationMs: number;
  meta?: Record<string, unknown>;
}

export async function logApiUsage(supabase: SupabaseClient, payload: UsageLogPayload): Promise<void> {
  const { error } = await supabase.from("api_usage_logs").insert({
    org_id: payload.orgId,
    api_key_id: payload.apiKeyId,
    route: payload.route,
    http_method: payload.method,
    status_code: payload.statusCode,
    duration_ms: payload.durationMs,
    meta: payload.meta ?? {},
  });

  if (error) throw new Error(`api_usage_logs: ${error.message}`);
}
