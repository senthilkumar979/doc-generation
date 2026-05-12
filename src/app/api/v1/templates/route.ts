import { NextResponse } from "next/server";

import { authorizeApiRequest } from "@/lib/api-v1/authorize-api-request";
import { jsonBadRequest } from "@/lib/api-v1/http";
import {
  createTemplateSchema,
  jsonLoggedError,
  logTemplateUsage,
  readJson,
  TEMPLATE_ROUTE,
  TEMPLATE_SELECT,
} from "@/lib/api-v1/template-routes";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const auth = await authorizeApiRequest(request);
  if (auth instanceof Response) return auth;

  const { supabase, orgId, apiKeyId } = auth;

  const { data, error } = await supabase
    .from("templates")
    .select(TEMPLATE_SELECT)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonLoggedError(supabase, orgId, apiKeyId, TEMPLATE_ROUTE, "GET", startedAt, error.message);
  }

  const list = data ?? [];
  await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ROUTE, "GET", 200, startedAt, { count: list.length });

  return NextResponse.json({ data: list });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const auth = await authorizeApiRequest(request);
  if (auth instanceof Response) return auth;

  const { supabase, orgId, apiKeyId } = auth;
  const parsed = createTemplateSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ROUTE, "POST", 400, startedAt, { validation: parsed.error.flatten() });
    return jsonBadRequest("Request body must include name and schema.");
  }

  const { data, error } = await supabase
    .from("templates")
    .insert({
      org_id: orgId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      schema: parsed.data.schema,
    })
    .select(TEMPLATE_SELECT)
    .single();

  if (error) {
    return jsonLoggedError(supabase, orgId, apiKeyId, TEMPLATE_ROUTE, "POST", startedAt, error.message);
  }

  await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ROUTE, "POST", 201, startedAt, { template_id: data.id });

  return NextResponse.json({ data }, { status: 201 });
}
