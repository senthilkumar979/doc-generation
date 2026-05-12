import { BlockType, type Block } from "@/types/template";
import { blockStylesToCss } from "../template-editor-utils";

import type { BlockComponentProps } from "./block-renderer-types";

type DividerBlockType = Extract<Block, { type: BlockType.Divider }>;

export function DividerBlock({ block }: BlockComponentProps) {
  const dividerBlock = block as DividerBlockType;

  return (
    <hr
      style={{
        ...blockStylesToCss(dividerBlock.styles),
        border: 0,
        borderTop: `${dividerBlock.content.thickness}px solid ${dividerBlock.content.color}`,
      }}
    />
  );
}
