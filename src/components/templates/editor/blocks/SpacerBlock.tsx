import { BlockType, type Block } from "@/types/template";
import { blockStylesToCss } from "../template-editor-utils";

import type { BlockComponentProps } from "./block-renderer-types";

type SpacerBlockType = Extract<Block, { type: BlockType.Spacer }>;

export function SpacerBlock({ block }: BlockComponentProps) {
  const spacerBlock = block as SpacerBlockType;

  return <div style={{ ...blockStylesToCss(spacerBlock.styles), height: spacerBlock.content.height }} />;
}
