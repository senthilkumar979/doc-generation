import { Columns2, FileImage, FileText, Heading1, Minus, PenLine, Rows3, Table2, Type } from "lucide-react";
import type { ComponentType } from "react";

import { BlockType } from "@/types/template";

export interface PaletteItem {
  type: BlockType;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export const paletteGroups: Array<{ title: string; items: PaletteItem[] }> = [
  {
    title: "Content",
    items: [
      { type: BlockType.Header, label: "Header", description: "Add a heading to your document", icon: Heading1 },
      { type: BlockType.Text, label: "Text", description: "Add paragraph text with variables", icon: Type },
      { type: BlockType.Image, label: "Image", description: "Place a logo or uploaded image", icon: FileImage },
    ],
  },
  {
    title: "Layout",
    items: [
      { type: BlockType.TwoColumn, label: "Two Column", description: "Split content into two columns", icon: Columns2 },
      { type: BlockType.Spacer, label: "Spacer", description: "Add vertical whitespace", icon: Rows3 },
      { type: BlockType.PageBreak, label: "Page Break", description: "Start the next PDF page", icon: FileText },
      { type: BlockType.Divider, label: "Divider", description: "Separate sections with a rule", icon: Minus },
    ],
  },
  { title: "Data", items: [{ type: BlockType.Table, label: "Table", description: "Render rows from static data", icon: Table2 }] },
  { title: "Signing", items: [{ type: BlockType.Signature, label: "Signature", description: "Add a signature line", icon: PenLine }] },
];
