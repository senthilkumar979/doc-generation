import { NextResponse } from "next/server";

import { authorizeApiRequest } from "@/lib/api-v1/authorize-api-request";
import { jsonBadRequest, jsonNotFound } from "@/lib/api-v1/http";
import {
  jsonLoggedError,
  logTemplateUsage,
  parseTemplateId,
  readJson,
  TEMPLATE_ID_ROUTE,
  TEMPLATE_SELECT,
  updateTemplateSchema,
} from "@/lib/api-v1/template-routes";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const startedAt = Date.now();
  const auth = await authorizeApiRequest(request);
  if (auth instanceof Response) return auth;

  const { supabase, orgId, apiKeyId } = auth;
  const id = await parseTemplateId(context);

  if (!id) {
    await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "GET", 400, startedAt, { reason: "invalid_uuid" });
    return jsonBadRequest("template id must be a UUID");
  }

  const { data, error } = await supabase
    .from("templates")
    .select(TEMPLATE_SELECT)
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    return jsonLoggedError(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "GET", startedAt, error.message);
  }

  if (!data) {
    await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "GET", 404, startedAt, { template_id: id });
    return jsonNotFound("Template not found");
  }

  await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "GET", 200, startedAt, { template_id: data.id });

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const startedAt = Date.now();
  const auth = await authorizeApiRequest(request);
  if (auth instanceof Response) return auth;

  const { supabase, orgId, apiKeyId } = auth;
  const id = await parseTemplateId(context);
  if (!id) return jsonBadRequest("template id must be a UUID");

  const parsed = updateTemplateSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "PATCH", 400, startedAt, { validation: parsed.error.flatten() });
    return jsonBadRequest("Request body must include at least one valid template field.");
  }

  const { data: existing, error: readError } = await supabase
    .from("templates")
    .select("id,version")
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .maybeSingle();

  if (readError) return jsonLoggedError(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "PATCH", startedAt, readError.message);
  if (!existing) {
    await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "PATCH", 404, startedAt, { template_id: id });
    return jsonNotFound("Template not found");
  }

  const { data, error } = await supabase
    .from("templates")
    .update({ ...parsed.data, version: existing.version + 1, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .select(TEMPLATE_SELECT)
    .single();

  if (error) return jsonLoggedError(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "PATCH", startedAt, error.message);

  await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "PATCH", 200, startedAt, { template_id: data.id });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const startedAt = Date.now();
  const auth = await authorizeApiRequest(request);
  if (auth instanceof Response) return auth;

  const { supabase, orgId, apiKeyId } = auth;
  const id = await parseTemplateId(context);
  if (!id) return jsonBadRequest("template id must be a UUID");

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("templates")
    .update({ deleted_at: now, updated_at: now })
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return jsonLoggedError(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "DELETE", startedAt, error.message);
  if (!data) {
    await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "DELETE", 404, startedAt, { template_id: id });
    return jsonNotFound("Template not found");
  }

  await logTemplateUsage(supabase, orgId, apiKeyId, TEMPLATE_ID_ROUTE, "DELETE", 200, startedAt, { template_id: id });
  return NextResponse.json({ data: { id, deleted: true } });
}
