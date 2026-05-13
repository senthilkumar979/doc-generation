"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import { BlockType, type Block } from "@/types/template";

import { BlockWrapper, type InsertPosition } from "./BlockWrapper";
import { BlockRenderer } from "./blocks/BlockRenderer";
import { blockTypes } from "./template-editor-utils";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [insertTarget, setInsertTarget] = useState<{ blockId: string; position: InsertPosition } | null>(null);
  const template = useTemplateEditorStore((state) => state.template);
  const selectedBlockId = useTemplateEditorStore((state) => state.selectedBlockId);
  const previewMode = useTemplateEditorStore((state) => state.previewMode);
  const insertBlock = useTemplateEditorStore((state) => state.insertBlock);
  const insertBlockInColumn = useTemplateEditorStore((state) => state.insertBlockInColumn);
  const moveBlockAfter = useTemplateEditorStore((state) => state.moveBlockAfter);
  const moveBlockToColumn = useTemplateEditorStore((state) => state.moveBlockToColumn);
  const setPreviewMode = useTemplateEditorStore((state) => state.setPreviewMode);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, Math.max(0.45, (entry.contentRect.width - 32) / PAGE_WIDTH)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function onDropAtCanvas(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setInsertTarget(null);
    const type = getPaletteBlockType(event);
    const blockId = getExistingBlockId(event);
    const lastBlockId = template.blocks.at(-1)?.id ?? null;
    if (type) insertBlock(type, lastBlockId);
    if (blockId) moveBlockAfter(blockId, lastBlockId);
  }

  function onDropAtBlock(blocks: Block[], blockId: string, position: InsertPosition, event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setInsertTarget(null);
    const afterBlockId = position === "before" ? previousBlockId(blocks, blockId) : blockId;
    const type = getPaletteBlockType(event);
    const draggedBlockId = getExistingBlockId(event);
    if (type) insertBlock(type, afterBlockId);
    if (draggedBlockId && draggedBlockId !== blockId && draggedBlockId !== afterBlockId) {
      moveBlockAfter(draggedBlockId, afterBlockId);
    }
  }

  function onDropAtColumn(parentBlockId: string, side: "left" | "right", event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setInsertTarget(null);
    const type = getPaletteBlockType(event);
    const draggedBlockId = getExistingBlockId(event);
    if (type) insertBlockInColumn(type, parentBlockId, side);
    if (draggedBlockId) moveBlockToColumn(draggedBlockId, parentBlockId, side);
  }

  function renderBlocks(blocks: Block[]) {
    return blocks.map((block) => (
      <BlockWrapper
        key={block.id}
        block={block}
        insertPosition={insertTarget?.blockId === block.id ? insertTarget.position : null}
        previewMode={previewMode}
        selected={block.id === selectedBlockId}
        onClearInsert={() => setInsertTarget(null)}
        onDragInsert={(targetId, position) => setInsertTarget({ blockId: targetId, position })}
        onDropAtBlock={(blockId, position, event) => onDropAtBlock(blocks, blockId, position, event)}
      >
        <BlockRenderer block={block} onDropAtColumn={onDropAtColumn} previewMode={previewMode} renderNestedBlocks={renderBlocks} />
      </BlockWrapper>
    ));
  }

  return (
    <main ref={containerRef} className="overflow-auto p-8" onDragOver={(event) => event.preventDefault()} onDrop={onDropAtCanvas}>
      {previewMode ? (
        <div className="mx-auto mb-4 flex max-w-[794px] items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-900">
          <span>Preview Mode — click Edit to return</span>
          <Button size="xs" variant="outline" onClick={() => setPreviewMode(false)}>
            Edit
          </Button>
        </div>
      ) : null}
      <div className="mx-auto" style={{ width: PAGE_WIDTH * scale, height: PAGE_HEIGHT * scale }}>
        <div
          className="min-h-[1123px] w-[794px] bg-white p-14 text-slate-950 shadow-2xl"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {template.blocks.length === 0 ? (
            <div className="flex min-h-[900px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
              Drag blocks here to build the PDF template.
            </div>
          ) : (
            <div className="space-y-3">{renderBlocks(template.blocks)}</div>
          )}
        </div>
      </div>
    </main>
  );
}

function previousBlockId(blocks: Block[], blockId: string): string | null {
  const index = blocks.findIndex((block) => block.id === blockId);
  return index > 0 ? blocks[index - 1].id : null;
}

function getPaletteBlockType(event: React.DragEvent): BlockType | null {
  const type = event.dataTransfer.getData("application/x-template-block") as BlockType;
  return blockTypes.includes(type) ? type : null;
}

function getExistingBlockId(event: React.DragEvent): string | null {
  return event.dataTransfer.getData("application/x-template-existing-block") || null;
}
