import { NextResponse } from "next/server";

import { tryLogApiUsage } from "@/lib/api-v1/async-log-usage";
import { authorizeApiRequest } from "@/lib/api-v1/authorize-api-request";

const ROUTE = "/api/v1/templates";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const auth = await authorizeApiRequest(request);
  if (auth instanceof Response) return auth;

  const { supabase, orgId, apiKeyId } = auth;

  const { data, error } = await supabase
    .from("templates")
    .select("id,name,template_type,created_at,updated_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const durationMs = Date.now() - startedAt;

  if (error) {
    await tryLogApiUsage(supabase, {
      orgId,
      apiKeyId,
      route: ROUTE,
      method: "GET",
      statusCode: 500,
      durationMs,
      meta: { message: error.message },
    });
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  const list = data ?? [];
  await tryLogApiUsage(supabase, {
    orgId,
    apiKeyId,
    route: ROUTE,
    method: "GET",
    statusCode: 200,
    durationMs,
    meta: { count: list.length },
  });

  return NextResponse.json({ data: list });
}
