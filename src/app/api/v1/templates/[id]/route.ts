import { NextResponse } from "next/server";
import { z } from "zod";

import { tryLogApiUsage } from "@/lib/api-v1/async-log-usage";
import { authorizeApiRequest } from "@/lib/api-v1/authorize-api-request";
import { jsonBadRequest, jsonNotFound } from "@/lib/api-v1/http";

const ROUTE = "/api/v1/templates/[id]";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const startedAt = Date.now();
  const auth = await authorizeApiRequest(request);
  if (auth instanceof Response) return auth;

  const { supabase, orgId, apiKeyId } = auth;
  const { id: rawId } = await context.params;
  const idParsed = z.string().uuid().safeParse(rawId);

  if (!idParsed.success) {
    await tryLogApiUsage(supabase, {
      orgId,
      apiKeyId,
      route: ROUTE,
      method: "GET",
      statusCode: 400,
      durationMs: Date.now() - startedAt,
      meta: { reason: "invalid_uuid" },
    });
    return jsonBadRequest("template id must be a UUID");
  }

  const { data, error } = await supabase
    .from("templates")
    .select("id,name,template_type,payload,created_at,updated_at")
    .eq("id", idParsed.data)
    .eq("org_id", orgId)
    .maybeSingle();

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

  if (!data) {
    await tryLogApiUsage(supabase, {
      orgId,
      apiKeyId,
      route: ROUTE,
      method: "GET",
      statusCode: 404,
      durationMs,
      meta: { template_id: idParsed.data },
    });
    return jsonNotFound("Template not found");
  }

  await tryLogApiUsage(supabase, {
    orgId,
    apiKeyId,
    route: ROUTE,
    method: "GET",
    statusCode: 200,
    durationMs,
    meta: { template_id: data.id },
  });

  return NextResponse.json({ data });
}
