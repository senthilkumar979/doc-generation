"use client";

import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import type { Block } from "@/types/template";

import { blockStylesToCss } from "./template-editor-utils";

export type InsertPosition = "before" | "after";

interface BlockWrapperProps {
  block: Block;
  children: ReactNode;
  insertPosition: InsertPosition | null;
  previewMode: boolean;
  selected: boolean;
  onDragInsert: (blockId: string, position: InsertPosition) => void;
  onDropAtBlock: (blockId: string, position: InsertPosition, event: React.DragEvent<HTMLElement>) => void;
  onClearInsert: () => void;
}

export function BlockWrapper({
  block,
  children,
  insertPosition,
  previewMode,
  selected,
  onDragInsert,
  onDropAtBlock,
  onClearInsert,
}: BlockWrapperProps) {
  const duplicateBlock = useTemplateEditorStore((state) => state.duplicateBlock);
  const moveBlock = useTemplateEditorStore((state) => state.moveBlock);
  const removeBlock = useTemplateEditorStore((state) => state.removeBlock);
  const selectBlock = useTemplateEditorStore((state) => state.selectBlock);

  return (
    <section
      draggable={!previewMode}
      className={cn(
        "group relative rounded-md border border-transparent p-2",
        !previewMode && "hover:border-blue-300",
        !previewMode && selected && "border-blue-500",
      )}
      style={blockStylesToCss(block.styles)}
      onClick={() => {
        if (!previewMode) selectBlock(block.id);
      }}
      onDragStart={(event) => {
        if (previewMode) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("application/x-template-existing-block", block.id);
      }}
      onDragOver={(event) => {
        if (previewMode) return;
        event.preventDefault();
        onDragInsert(block.id, getInsertPosition(event));
      }}
      onDragLeave={onClearInsert}
      onDrop={(event) => {
        if (previewMode) return;
        onDropAtBlock(block.id, getInsertPosition(event), event);
      }}
    >
      {!previewMode ? (
        <>
          <div className="absolute left-[-1.75rem] top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-background p-1 text-muted-foreground shadow-sm group-hover:block">
            <GripVertical className="size-4" />
          </div>
          <BlockToolbar
            onDuplicate={() => duplicateBlock(block.id)}
            onMoveDown={() => moveBlock(block.id, "down")}
            onMoveUp={() => moveBlock(block.id, "up")}
            onRemove={() => removeBlock(block.id)}
          />
          {insertPosition ? (
            <div className={cn("absolute inset-x-0 h-0.5 bg-blue-500", insertPosition === "before" ? "-top-1" : "-bottom-1")} />
          ) : null}
        </>
      ) : null}
      {children}
    </section>
  );
}

function BlockToolbar({
  onDuplicate,
  onMoveDown,
  onMoveUp,
  onRemove,
}: {
  onDuplicate: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="absolute -top-8 right-0 z-10 hidden items-center gap-1 rounded-md border border-border bg-background p-1 shadow-sm group-hover:flex">
      <ToolbarButton label="Move up" onClick={onMoveUp}>
        <ArrowUp />
      </ToolbarButton>
      <ToolbarButton label="Move down" onClick={onMoveDown}>
        <ArrowDown />
      </ToolbarButton>
      <ToolbarButton label="Duplicate" onClick={onDuplicate}>
        <Copy />
      </ToolbarButton>
      <ToolbarButton label="Delete" onClick={onRemove}>
        <Trash2 />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <Button
      aria-label={label}
      variant="ghost"
      size="xs"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {children}
    </Button>
  );
}

function getInsertPosition(event: React.DragEvent<HTMLElement>): InsertPosition {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientY < rect.top + rect.height / 2 ? "before" : "after";
}
