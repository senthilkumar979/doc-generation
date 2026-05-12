import { BlockType, type Block } from "@/types/template";

export type BlockDirection = "up" | "down";

export interface BlockListResult {
  blocks: Block[];
  changed: boolean;
}

export interface DuplicateBlockResult extends BlockListResult {
  duplicatedId?: string;
}

export function updateBlockById(blocks: Block[], id: string, updater: (block: Block) => Block): BlockListResult {
  let changed = false;
  const nextBlocks = blocks.map((block) => {
    if (block.id === id) {
      changed = true;
      return updater(block);
    }
    if (block.type !== BlockType.TwoColumn) return block;
    const left = updateBlockById(block.content.left, id, updater);
    const right = updateBlockById(block.content.right, id, updater);
    if (!left.changed && !right.changed) return block;
    changed = true;
    return { ...block, content: { ...block.content, left: left.blocks, right: right.blocks } };
  });
  return { blocks: nextBlocks, changed };
}

export function insertBlockAfter(blocks: Block[], afterBlockId: string, blockToInsert: Block): BlockListResult {
  const index = blocks.findIndex((block) => block.id === afterBlockId);
  if (index >= 0) {
    return { blocks: [...blocks.slice(0, index + 1), blockToInsert, ...blocks.slice(index + 1)], changed: true };
  }
  return updateNestedLists(blocks, (children) => insertBlockAfter(children, afterBlockId, blockToInsert));
}

export function removeBlockById(blocks: Block[], id: string): BlockListResult {
  const nextBlocks = blocks.filter((block) => block.id !== id);
  if (nextBlocks.length !== blocks.length) return { blocks: nextBlocks, changed: true };
  return updateNestedLists(blocks, (children) => removeBlockById(children, id));
}

export function duplicateBlockById(blocks: Block[], id: string): DuplicateBlockResult {
  const index = blocks.findIndex((block) => block.id === id);
  if (index >= 0) {
    const duplicate = cloneBlockWithNewIds(blocks[index]);
    return {
      blocks: [...blocks.slice(0, index + 1), duplicate, ...blocks.slice(index + 1)],
      changed: true,
      duplicatedId: duplicate.id,
    };
  }

  let changed = false;
  let duplicatedId: string | undefined;
  const nextBlocks = blocks.map((block) => {
    if (block.type !== BlockType.TwoColumn) return block;
    const left = duplicateBlockById(block.content.left, id);
    const right = duplicateBlockById(block.content.right, id);
    if (!left.changed && !right.changed) return block;
    changed = true;
    duplicatedId = left.duplicatedId ?? right.duplicatedId;
    return { ...block, content: { ...block.content, left: left.blocks, right: right.blocks } };
  });
  return { blocks: nextBlocks, changed, duplicatedId };
}

export function moveBlockById(blocks: Block[], id: string, direction: BlockDirection): BlockListResult {
  const index = blocks.findIndex((block) => block.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index >= 0 && targetIndex >= 0 && targetIndex < blocks.length) {
    const nextBlocks = [...blocks];
    [nextBlocks[index], nextBlocks[targetIndex]] = [nextBlocks[targetIndex], nextBlocks[index]];
    return { blocks: nextBlocks, changed: true };
  }
  return updateNestedLists(blocks, (children) => moveBlockById(children, id, direction));
}

function updateNestedLists(blocks: Block[], updater: (blocks: Block[]) => BlockListResult): BlockListResult {
  let changed = false;
  const nextBlocks = blocks.map((block) => {
    if (block.type !== BlockType.TwoColumn) return block;
    const left = updater(block.content.left);
    const right = updater(block.content.right);
    if (!left.changed && !right.changed) return block;
    changed = true;
    return { ...block, content: { ...block.content, left: left.blocks, right: right.blocks } };
  });
  return { blocks: nextBlocks, changed };
}

function cloneBlockWithNewIds(block: Block): Block {
  const clone = structuredClone(block);
  if (clone.type !== BlockType.TwoColumn) return { ...clone, id: crypto.randomUUID() };
  return {
    ...clone,
    id: crypto.randomUUID(),
    content: {
      ...clone.content,
      left: clone.content.left.map(cloneBlockWithNewIds),
      right: clone.content.right.map(cloneBlockWithNewIds),
    },
  };
}
