import { BlockType, type Block, type Template, type TemplateVariable } from "@/types/template";

export const VARIABLE_TOKEN_PATTERN = /\{\{\{\s*([a-z][a-zA-Z0-9]*)\s*\}\}\}/g;
export const VARIABLE_REFERENCE_PATTERN = /^\{\{\{\s*([a-z][a-zA-Z0-9]*)\s*\}\}\}$/;

export function variableReference(key: string): `{{{${string}}}}` {
  return `{{{${key}}}}`;
}

export function extractVariableKeys(text: string): string[] {
  return Array.from(text.matchAll(VARIABLE_TOKEN_PATTERN), (match) => match[1]);
}

export function getVariableReferenceKey(value: string): string | null {
  return VARIABLE_REFERENCE_PATTERN.exec(value)?.[1] ?? null;
}

export function withDiscoveredVariables(template: Template): Template {
  const existingKeys = new Set(template.variables.map((variable) => variable.key));
  const discoveredVariables = collectVariableKeys(template.blocks)
    .filter((key) => !existingKeys.has(key))
    .map(createDiscoveredVariable);

  if (discoveredVariables.length === 0) return template;
  return { ...template, variables: [...template.variables, ...discoveredVariables] };
}

export function getIncompleteVariables(variables: TemplateVariable[]): TemplateVariable[] {
  return variables.filter((variable) => !variable.label.trim());
}

function collectVariableKeys(blocks: Block[]): string[] {
  const keys = new Set<string>();
  for (const block of blocks) {
    collectBlockVariableKeys(block).forEach((key) => keys.add(key));
  }
  return [...keys];
}

function collectBlockVariableKeys(block: Block): string[] {
  switch (block.type) {
    case BlockType.Header:
    case BlockType.Text:
      return extractVariableKeys(block.content.text);
    case BlockType.Table:
      return typeof block.content.rows === "string" ? extractVariableKeys(block.content.rows) : [];
    case BlockType.Image:
      return extractVariableKeys(block.content.src);
    case BlockType.TwoColumn:
      return [...collectVariableKeys(block.content.left), ...collectVariableKeys(block.content.right)];
    default:
      return [];
  }
}

function createDiscoveredVariable(key: string): TemplateVariable {
  return { key, label: "", type: "text", defaultValue: "" };
}
