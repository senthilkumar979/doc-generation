import type { TemplateType } from "@/lib/templates/constants";

export interface TemplateRowDto {
  id: string;
  name: string;
  template_type: TemplateType;
  payload: unknown;
}
