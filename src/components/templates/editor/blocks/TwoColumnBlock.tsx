import type { ReactNode } from "react";

import { BlockType, type Block } from "@/types/template";
import { blockStylesToCss } from "../template-editor-utils";

import { BlockRenderer } from "./BlockRenderer";
import type { BlockComponentProps } from "./block-renderer-types";

type TwoColumnBlockType = Extract<Block, { type: BlockType.TwoColumn }>;

interface TwoColumnBlockProps extends BlockComponentProps {
  onDropAtColumn?: (parentBlockId: string, side: ColumnSide, event: React.DragEvent<HTMLDivElement>) => void;
  renderNestedBlocks?: (blocks: Block[]) => ReactNode;
}

type ColumnSide = "left" | "right";

export function TwoColumnBlock({ block, onDropAtColumn, previewMode, renderNestedBlocks }: TwoColumnBlockProps) {
  const twoColumnBlock = block as TwoColumnBlockType;
  const [left, right] = splitToColumns[twoColumnBlock.content.split];

  return (
    <div
      className="grid gap-4"
      style={{ ...blockStylesToCss(twoColumnBlock.styles), gridTemplateColumns: `${left}fr ${right}fr` }}
    >
      <Column
        blocks={twoColumnBlock.content.left}
        emptyLabel="Left column"
        onDropAtColumn={onDropAtColumn}
        parentBlockId={twoColumnBlock.id}
        previewMode={previewMode}
        renderNestedBlocks={renderNestedBlocks}
        side="left"
      />
      <Column
        blocks={twoColumnBlock.content.right}
        emptyLabel="Right column"
        onDropAtColumn={onDropAtColumn}
        parentBlockId={twoColumnBlock.id}
        previewMode={previewMode}
        renderNestedBlocks={renderNestedBlocks}
        side="right"
      />
    </div>
  );
}

function Column({
  blocks,
  emptyLabel,
  onDropAtColumn,
  parentBlockId,
  previewMode,
  renderNestedBlocks,
  side,
}: {
  blocks: Block[];
  emptyLabel: string;
  onDropAtColumn?: (parentBlockId: string, side: ColumnSide, event: React.DragEvent<HTMLDivElement>) => void;
  parentBlockId: string;
  previewMode: boolean;
  renderNestedBlocks?: (blocks: Block[]) => ReactNode;
  side: ColumnSide;
}) {
  if (blocks.length === 0 && !previewMode) {
    return (
      <div
        className="min-h-24 rounded border border-dashed border-slate-300 p-3 text-xs text-slate-500"
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDrop={(event) => onDropAtColumn?.(parentBlockId, side, event)}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      className="min-h-24 space-y-3 rounded border border-transparent"
      onDragOver={(event) => {
        if (previewMode) return;
        event.preventDefault();
        event.stopPropagation();
      }}
      onDrop={(event) => onDropAtColumn?.(parentBlockId, side, event)}
    >
      {renderNestedBlocks
        ? renderNestedBlocks(blocks)
        : blocks.map((block) => <BlockRenderer key={block.id} block={block} previewMode={previewMode} />)}
    </div>
  );
}

const splitToColumns: Record<TwoColumnBlockType["content"]["split"], [number, number]> = {
  "50-50": [1, 1],
  "60-40": [3, 2],
  "40-60": [2, 3],
  "70-30": [7, 3],
};
