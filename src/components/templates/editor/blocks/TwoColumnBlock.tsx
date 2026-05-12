import { BlockType, type Block } from "@/types/template";
import { blockStylesToCss } from "../template-editor-utils";

import { BlockRenderer } from "./BlockRenderer";
import type { BlockComponentProps } from "./block-renderer-types";

type TwoColumnBlockType = Extract<Block, { type: BlockType.TwoColumn }>;

export function TwoColumnBlock({ block, previewMode }: BlockComponentProps) {
  const twoColumnBlock = block as TwoColumnBlockType;
  const [left, right] = splitToColumns[twoColumnBlock.content.split];

  return (
    <div
      className="grid gap-4"
      style={{ ...blockStylesToCss(twoColumnBlock.styles), gridTemplateColumns: `${left}fr ${right}fr` }}
    >
      <Column blocks={twoColumnBlock.content.left} previewMode={previewMode} emptyLabel="Left column" />
      <Column blocks={twoColumnBlock.content.right} previewMode={previewMode} emptyLabel="Right column" />
    </div>
  );
}

function Column({ blocks, emptyLabel, previewMode }: { blocks: Block[]; emptyLabel: string; previewMode: boolean }) {
  if (blocks.length === 0 && !previewMode) {
    return <div className="rounded border border-dashed border-slate-300 p-3 text-xs text-slate-500">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} previewMode={previewMode} />
      ))}
    </div>
  );
}

const splitToColumns: Record<TwoColumnBlockType["content"]["split"], [number, number]> = {
  "50-50": [1, 1],
  "60-40": [3, 2],
  "40-60": [2, 3],
  "70-30": [7, 3],
};
