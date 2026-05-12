import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { tryLogApiUsage } from "./async-log-usage";
import type { UsageLogPayload } from "./log-api-usage";

export const TEMPLATE_SELECT = "id,name,description,page_size,orientation,schema,version,created_at,updated_at";
export const TEMPLATE_ROUTE = "/api/v1/templates";
export const TEMPLATE_ID_ROUTE = "/api/v1/templates/[id]";

export const createTemplateSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(1_000).nullable().optional(),
    schema: z.record(z.string(), z.unknown()),
  })
  .strict();

export const updateTemplateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(1_000).nullable().optional(),
    page_size: z.enum(["A4", "Letter", "Legal"]).optional(),
    orientation: z.enum(["portrait", "landscape"]).optional(),
    schema: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one update field is required.");

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function parseTemplateId(context: { params: Promise<{ id: string }> }): Promise<string | null> {
  const { id } = await context.params;
  const parsed = z.string().uuid().safeParse(id);
  return parsed.success ? parsed.data : null;
}

export async function logTemplateUsage(
  supabase: SupabaseClient,
  orgId: string,
  apiKeyId: string,
  route: string,
  method: UsageLogPayload["method"],
  statusCode: number,
  startedAt: number,
  meta?: Record<string, unknown>,
): Promise<void> {
  await tryLogApiUsage(supabase, {
    orgId,
    apiKeyId,
    route,
    method,
    statusCode,
    durationMs: Date.now() - startedAt,
    meta,
  });
}

export async function jsonLoggedError(
  supabase: SupabaseClient,
  orgId: string,
  apiKeyId: string,
  route: string,
  method: UsageLogPayload["method"],
  startedAt: number,
  message: string,
): Promise<Response> {
  await logTemplateUsage(supabase, orgId, apiKeyId, route, method, 500, startedAt, { message });
  return NextResponse.json({ error: { message } }, { status: 500 });
}
