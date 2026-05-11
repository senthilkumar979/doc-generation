export const TEMPLATE_TYPES = ["blank", "letter"] as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export function isTemplateType(value: unknown): value is TemplateType {
  return TEMPLATE_TYPES.includes(value as TemplateType);
}
