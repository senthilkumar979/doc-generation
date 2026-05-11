import type { SupabaseClient } from "@supabase/supabase-js";

import type { UsageLogPayload } from "./log-api-usage";
import { logApiUsage } from "./log-api-usage";

export async function tryLogApiUsage(supabase: SupabaseClient, payload: UsageLogPayload): Promise<void> {
  try {
    await logApiUsage(supabase, payload);
  } catch {
    /* Preserve API responses if logging inserts fail */
  }
}
