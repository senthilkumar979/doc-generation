import { z } from "zod";

import type { TemplateType } from "./constants";
import { isTemplateType } from "./constants";

const nameSchema = z.string().trim().min(1).max(120);
const uuidSchema = z.string().uuid();

export interface ParsedCreateTemplateForm {
  name: string;
  template_type: TemplateType;
  rawPayload: unknown;
}

export interface ParsedUpdateTemplateForm extends ParsedCreateTemplateForm {
  id: string;
}

function templateTypeFromForm(formData: FormData): TemplateType | null {
  const raw = formData.get("template_type");
  return isTemplateType(raw) ? raw : null;
}

export function parseCreateTemplateForm(
  formData: FormData,
): { ok: true; value: ParsedCreateTemplateForm } | { ok: false; error: string } {
  const name = nameSchema.safeParse(formData.get("name"));
  const template_type = templateTypeFromForm(formData);
  if (!name.success) return { ok: false, error: "Name must be 1–120 characters." };
  if (!template_type) return { ok: false, error: "Choose a template type." };

  if (template_type === "blank") {
    return { ok: true, value: { name: name.data, template_type, rawPayload: {} } };
  }

  const subject = z.string().trim().min(1).max(200).safeParse(formData.get("subject"));
  const content = z.string().trim().min(1).max(20_000).safeParse(formData.get("content"));
  if (!subject.success || !content.success) {
    return { ok: false, error: "Letter templates need a subject and body." };
  }

  return {
    ok: true,
    value: {
      name: name.data,
      template_type,
      rawPayload: { subject: subject.data, content: content.data },
    },
  };
}

export function parseUpdateTemplateForm(
  formData: FormData,
): { ok: true; value: ParsedUpdateTemplateForm } | { ok: false; error: string } {
  const id = uuidSchema.safeParse(formData.get("id"));
  if (!id.success) return { ok: false, error: "Invalid template id." };

  const base = parseCreateTemplateForm(formData);
  if (!base.ok) return base;

  return { ok: true, value: { ...base.value, id: id.data } };
}
