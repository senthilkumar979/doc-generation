import { BlockType, type Block } from "@/types/template";

export type BlockDirection = "up" | "down";
export type ColumnSide = "left" | "right";

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

export function insertBlockAt(blocks: Block[], afterBlockId: string | null, blockToInsert: Block): BlockListResult {
  if (!afterBlockId) return { blocks: [blockToInsert, ...blocks], changed: true };
  return insertBlockAfter(blocks, afterBlockId, blockToInsert);
}

export function insertBlockInColumn(blocks: Block[], parentBlockId: string, side: ColumnSide, blockToInsert: Block): BlockListResult {
  return updateBlockById(blocks, parentBlockId, (block) => {
    if (block.type !== BlockType.TwoColumn) return block;
    return { ...block, content: { ...block.content, [side]: [...block.content[side], blockToInsert] } };
  });
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

export function moveBlockAfter(blocks: Block[], id: string, afterBlockId: string | null): BlockListResult {
  if (id === afterBlockId) return { blocks, changed: false };
  const extracted = extractBlockById(blocks, id);
  if (!extracted.block) return { blocks, changed: false };
  const inserted = insertExistingBlockAfter(extracted.blocks, afterBlockId, extracted.block);
  return inserted.changed ? inserted : { blocks, changed: false };
}

export function moveBlockToColumn(blocks: Block[], id: string, parentBlockId: string, side: ColumnSide): BlockListResult {
  if (id === parentBlockId) return { blocks, changed: false };
  const extracted = extractBlockById(blocks, id);
  if (!extracted.block) return { blocks, changed: false };
  const inserted = insertBlockInColumn(extracted.blocks, parentBlockId, side, extracted.block);
  return inserted.changed ? inserted : { blocks, changed: false };
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

function extractBlockById(blocks: Block[], id: string): BlockListResult & { block?: Block } {
  const index = blocks.findIndex((block) => block.id === id);
  if (index >= 0) return { blocks: blocks.filter((block) => block.id !== id), block: blocks[index], changed: true };

  let changed = false;
  let extractedBlock: Block | undefined;
  const nextBlocks = blocks.map((block) => {
    if (block.type !== BlockType.TwoColumn) return block;
    const left = extractBlockById(block.content.left, id);
    const right = extractBlockById(block.content.right, id);
    if (!left.changed && !right.changed) return block;
    changed = true;
    extractedBlock = left.block ?? right.block;
    return { ...block, content: { ...block.content, left: left.blocks, right: right.blocks } };
  });
  return { blocks: nextBlocks, block: extractedBlock, changed };
}

function insertExistingBlockAfter(blocks: Block[], afterBlockId: string | null, blockToInsert: Block): BlockListResult {
  if (!afterBlockId) return { blocks: [blockToInsert, ...blocks], changed: true };
  const index = blocks.findIndex((block) => block.id === afterBlockId);
  if (index >= 0) return { blocks: [...blocks.slice(0, index + 1), blockToInsert, ...blocks.slice(index + 1)], changed: true };
  return updateNestedLists(blocks, (children) => insertExistingBlockAfter(children, afterBlockId, blockToInsert));
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
