import { z } from "zod";

import { tryLogApiUsage } from "@/lib/api-v1/async-log-usage";
import { authorizeApiRequest } from "@/lib/api-v1/authorize-api-request";
import { jsonBadRequest, jsonNotFound, jsonNotImplemented } from "@/lib/api-v1/http";

const ROUTE = "/api/v1/documents/render";

const schema = z
  .object({
    template_id: z.string().uuid(),
    format: z.literal("pdf").optional(),
  })
  .strict();

export async function POST(request: Request) {
  const startedAt = Date.now();
  const auth = await authorizeApiRequest(request);
  if (auth instanceof Response) return auth;

  const { supabase, orgId, apiKeyId } = auth;

  let parsed: ReturnType<(typeof schema)["safeParse"]>;
  try {
    parsed = schema.safeParse(await request.json());
  } catch {
    parsed = schema.safeParse({});
  }

  const durationEarly = Date.now() - startedAt;

  if (!parsed.success) {
    await tryLogApiUsage(supabase, {
      orgId,
      apiKeyId,
      route: ROUTE,
      method: "POST",
      statusCode: 400,
      durationMs: durationEarly,
      meta: { validation: parsed.error.flatten() },
    });
    return jsonBadRequest("Request body must be JSON with a template_id UUID");
  }

  const { data: row } = await supabase
    .from("templates")
    .select("id")
    .eq("id", parsed.data.template_id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .maybeSingle();

  const durationMs = Date.now() - startedAt;

  if (!row) {
    await tryLogApiUsage(supabase, {
      orgId,
      apiKeyId,
      route: ROUTE,
      method: "POST",
      statusCode: 404,
      durationMs,
      meta: { template_id: parsed.data.template_id },
    });
    return jsonNotFound("Template not found");
  }

  await tryLogApiUsage(supabase, {
    orgId,
    apiKeyId,
    route: ROUTE,
    method: "POST",
    statusCode: 501,
    durationMs,
    meta: {
      template_id: parsed.data.template_id,
      format: parsed.data.format ?? "pdf",
    },
  });

  return jsonNotImplemented(
    "PDF rendering is not enabled yet. Trigger.dev will pick this up next; your API key and template were recognized.",
    "render_not_ready",
  );
}
