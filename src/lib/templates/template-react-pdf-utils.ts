import type { Style } from "@react-pdf/types";

import type { BlockStyles, Template, TemplateVariable } from "@/types/template";

type TemplateData = Record<string, unknown>;

export function interpolate(text: string, data: TemplateData, variables: TemplateVariable[] = []): string {
  const variableMap = new Map(variables.map((variable) => [variable.key, variable]));
  return text.replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (_token, key: string) => formatValue(data[key], variableMap.get(key)));
}

export function blockStylesToReactPDF(styles: BlockStyles): Style {
  return {
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
    borderRadius: styles.borderRadius,
    borderWidth: styles.borderWidth,
    color: styles.color,
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    textAlign: styles.textAlign,
    width: styles.width,
    ...spacingToReactPDF("padding", styles.padding),
    ...spacingToReactPDF("margin", styles.margin),
  };
}

export function formatValue(value: unknown, variable?: TemplateVariable): string {
  if (value === null || value === undefined) return "";
  if (variable?.type === "currency") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0);
  }
  if (variable?.type === "date") {
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-US").format(date);
  }
  return String(value);
}

export function pageStyle(template: Template): Style {
  return {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: mmToPt(template.margins.top),
    paddingBottom: mmToPt(template.margins.bottom),
    paddingLeft: mmToPt(template.margins.left),
    paddingRight: mmToPt(template.margins.right),
  };
}

export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export function isRecord(value: unknown): value is TemplateData {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function spacingToReactPDF(prefix: "padding" | "margin", value: BlockStyles["padding"]): Style {
  if (typeof value === "number") return { [prefix]: value } as Style;
  if (!value) return {};
  const style: Record<string, number> = {};
  if (value.top !== undefined) style[`${prefix}Top`] = value.top;
  if (value.right !== undefined) style[`${prefix}Right`] = value.right;
  if (value.bottom !== undefined) style[`${prefix}Bottom`] = value.bottom;
  if (value.left !== undefined) style[`${prefix}Left`] = value.left;
  return style as Style;
}

function mmToPt(mm: number): number {
  return (mm * 72) / 25.4;
}
