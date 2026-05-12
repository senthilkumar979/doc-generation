import type { TemplateVariable } from "@/types/template";

export type VariableType = TemplateVariable["type"];

export function validateVariableKey(key: string, variables: TemplateVariable[]): string | null {
  if (!key) return null;
  if (!/^[a-z][a-zA-Z0-9]*$/.test(key)) return "Use camelCase letters and numbers only.";
  if (variables.some((variable) => variable.key === key)) return "A variable with this key already exists.";
  return null;
}

export function toCamelCase(value: string): string {
  const words = value.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  return words
    .map((word, index) => {
      const normalized = word.charAt(0).toUpperCase() + word.slice(1);
      return index === 0 ? word.charAt(0).toLowerCase() + word.slice(1) : normalized;
    })
    .join("");
}

export function buildPayloadShape(templateId: string, variables: TemplateVariable[]): string {
  const data = Object.fromEntries(variables.map((variable) => [variable.key, sampleValue(variable)]));
  return JSON.stringify({ templateId: templateId || "...", data }, null, 2);
}

function sampleValue(variable: TemplateVariable): string | number | boolean {
  if (variable.defaultValue) {
    if (variable.type === "number" || variable.type === "currency") return Number(variable.defaultValue) || 0;
    if (variable.type === "boolean") return variable.defaultValue === "true";
    return variable.defaultValue;
  }
  if (variable.type === "number" || variable.type === "currency") return variable.key.toLowerCase().includes("amount") ? 5000 : 0;
  if (variable.type === "boolean") return true;
  if (variable.type === "date") return "2026-05-12";
  return variable.key.toLowerCase().includes("customer") ? "ABC Ltd" : "Example value";
}

export const variableTypes: VariableType[] = ["text", "number", "date", "currency", "boolean"];
