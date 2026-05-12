import type { CSSProperties } from "react";

import { BlockType, type Block, type BlockStyles, type Template } from "@/types/template";

export const blockTypeLabels: Record<BlockType, string> = {
  [BlockType.Header]: "Header",
  [BlockType.Text]: "Text",
  [BlockType.Table]: "Table",
  [BlockType.Image]: "Image",
  [BlockType.Divider]: "Divider",
  [BlockType.Spacer]: "Spacer",
  [BlockType.TwoColumn]: "Two column",
  [BlockType.Signature]: "Signature",
  [BlockType.PageBreak]: "Page break",
};

export const blockTypes = Object.values(BlockType);

export interface TemplateApiRow {
  id: string;
  name: string;
  description: string | null;
  page_size: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  schema: Partial<Template> | null;
  created_at: string;
  updated_at: string;
}

export function templateFromApiRow(row: TemplateApiRow): Template {
  return {
    id: row.id,
    name: row.schema?.name ?? row.name,
    description: row.schema?.description ?? row.description ?? "",
    orgId: row.schema?.orgId ?? "",
    createdAt: row.schema?.createdAt ?? row.created_at,
    updatedAt: row.schema?.updatedAt ?? row.updated_at,
    pageSize: row.schema?.pageSize ?? row.page_size,
    orientation: row.schema?.orientation ?? row.orientation,
    margins: row.schema?.margins ?? { top: 20, bottom: 20, left: 20, right: 20 },
    variables: row.schema?.variables ?? [],
    blocks: row.schema?.blocks ?? [],
  };
}

export function findBlockById(blocks: Block[], id: string | null): Block | null {
  if (!id) return null;
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.type === BlockType.TwoColumn) {
      const nested = findBlockById([...block.content.left, ...block.content.right], id);
      if (nested) return nested;
    }
  }
  return null;
}

export function blockStylesToCss(styles: BlockStyles): CSSProperties {
  const padding = toBoxSpacing(styles.padding);
  const margin = toBoxSpacing(styles.margin);

  return {
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
    borderRadius: styles.borderRadius,
    borderWidth: styles.borderWidth,
    color: styles.color,
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    margin: typeof styles.margin === "number" ? styles.margin : undefined,
    marginBottom: margin?.bottom,
    marginLeft: margin?.left,
    marginRight: margin?.right,
    marginTop: margin?.top,
    padding: typeof styles.padding === "number" ? styles.padding : undefined,
    paddingBottom: padding?.bottom,
    paddingLeft: padding?.left,
    paddingRight: padding?.right,
    paddingTop: padding?.top,
    textAlign: styles.textAlign,
    width: styles.width,
  };
}

function toBoxSpacing(value: BlockStyles["padding"]): { top?: number; right?: number; bottom?: number; left?: number } | null {
  return typeof value === "object" && value !== null ? value : null;
}
