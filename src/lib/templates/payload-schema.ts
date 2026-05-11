import { z } from "zod";

import type { TemplateType } from "./constants";

export const letterPayloadSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(20_000),
});

const blankPayloadSchema = z.object({});

export type LetterPayload = z.infer<typeof letterPayloadSchema>;
export type BlankPayload = z.infer<typeof blankPayloadSchema>;
export type TemplatePayload = BlankPayload | LetterPayload;

export function parseTemplatePayload(
  templateType: TemplateType,
  raw: unknown,
): { ok: true; payload: TemplatePayload } | { ok: false; error: string } {
  const schema = templateType === "letter" ? letterPayloadSchema : blankPayloadSchema;
  const parsed = schema.safeParse(templateType === "blank" ? (raw ?? {}) : raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(" ");
    return { ok: false, error: msg || "Invalid template data." };
  }
  return { ok: true, payload: parsed.data };
}
