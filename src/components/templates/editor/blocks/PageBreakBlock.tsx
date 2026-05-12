import { BlockType, type Block } from "@/types/template";
import { blockStylesToCss } from "../template-editor-utils";

import type { BlockComponentProps } from "./block-renderer-types";

type PageBreakBlockType = Extract<Block, { type: BlockType.PageBreak }>;

export function PageBreakBlock({ block, previewMode }: BlockComponentProps) {
  const pageBreakBlock = block as PageBreakBlockType;

  if (previewMode) return null;

  return (
    <div
      className="border-t border-dashed border-slate-400 py-2 text-center text-xs uppercase text-slate-500"
      style={blockStylesToCss(pageBreakBlock.styles)}
    >
      Page Break
    </div>
  );
}
