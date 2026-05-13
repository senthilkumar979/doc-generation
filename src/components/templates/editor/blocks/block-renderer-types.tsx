import type { ReactNode } from "react";

import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import { VARIABLE_REFERENCE_PATTERN, VARIABLE_TOKEN_PATTERN } from "@/lib/templates/template-variables";
import type { Block, TemplateVariable } from "@/types/template";

export interface BlockComponentProps {
  block: Block;
  previewMode: boolean;
}

export function renderPreviewText(text: string, variables: TemplateVariable[]): ReactNode {
  const variableMap = new Map(variables.map((variable) => [variable.key, variable.defaultValue]));
  return splitVariableText(text).map((part, index) => {
    const match = variableMatch(part);
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
  return splitVariableText(text).map((part, index) =>
    variableMatch(part) ? (
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

function splitVariableText(text: string): string[] {
  const parts: string[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(VARIABLE_TOKEN_PATTERN)) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function variableMatch(text: string): RegExpExecArray | null {
  return VARIABLE_REFERENCE_PATTERN.exec(text);
}
