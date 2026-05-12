import type { ReactNode } from "react";

import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import type { Block, TemplateVariable } from "@/types/template";

export interface BlockComponentProps {
  block: Block;
  previewMode: boolean;
}

export function renderPreviewText(text: string, variables: TemplateVariable[]): ReactNode {
  const variableMap = new Map(variables.map((variable) => [variable.key, variable.defaultValue]));
  return text.split(/(\{\{[^}]+\}\})/g).map((part, index) => {
    const match = /^\{\{\s*([^}\s]+)\s*\}\}$/.exec(part);
    if (!match) return part;
    const value = variableMap.get(match[1]);
    if (value !== undefined) return value;
    return (
      <span key={`${part}-${index}`} className="text-orange-600 underline decoration-dashed underline-offset-4">
        {part}
      </span>
    );
  });
}

export function renderEditText(text: string): ReactNode {
  return text.split(/(\{\{[^}]+\}\})/g).map((part, index) =>
    /^\{\{[^}]+\}\}$/.test(part) ? (
      <span key={`${part}-${index}`} className="rounded bg-blue-50 px-0.5 text-blue-700">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function useTemplateVariables(): TemplateVariable[] {
  return useTemplateEditorStore((state) => state.template.variables);
}
