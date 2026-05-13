import { beforeEach, describe, expect, it } from "vitest";

import { BlockType, type Template } from "@/types/template";

import { useTemplateBuilderStore } from "./template-builder-store";

describe("useTemplateBuilderStore", () => {
  beforeEach(() => {
    useTemplateBuilderStore.getState().setTemplate(createTemplate());
  });

  it("adds blocks, selects the new block, and tracks history", () => {
    const store = useTemplateBuilderStore.getState();

    store.addBlock(BlockType.Header);
    const firstBlock = useTemplateBuilderStore.getState().template.blocks[0];
    useTemplateBuilderStore.getState().addBlock(BlockType.Text, firstBlock.id);

    const state = useTemplateBuilderStore.getState();
    expect(state.template.blocks.map((block) => block.type)).toEqual([BlockType.Header, BlockType.Text]);
    expect(state.selectedBlockId).toBe(state.template.blocks[1].id);
    expect(state.isDirty).toBe(true);
    expect(state.history).toHaveLength(3);
  });

  it("updates block styles and content", () => {
    useTemplateBuilderStore.getState().addBlock(BlockType.Text);
    const blockId = useTemplateBuilderStore.getState().template.blocks[0].id;

    useTemplateBuilderStore.getState().updateBlockStyles(blockId, { color: "#0f172a" });
    useTemplateBuilderStore.getState().updateBlockContent(blockId, { text: "Hello {{{name}}}" });

    const block = useTemplateBuilderStore.getState().template.blocks[0];
    expect(block.styles.color).toBe("#0f172a");
    expect(block.content).toMatchObject({ text: "Hello {{{name}}}" });
    expect(useTemplateBuilderStore.getState().template.variables).toContainEqual({ key: "name", label: "", type: "text", defaultValue: "" });
  });

  it("duplicates, moves, and removes blocks", () => {
    const store = useTemplateBuilderStore.getState();
    store.addBlock(BlockType.Header);
    store.addBlock(BlockType.Text);

    const headerId = useTemplateBuilderStore.getState().template.blocks[0].id;
    useTemplateBuilderStore.getState().duplicateBlock(headerId);
    expect(useTemplateBuilderStore.getState().template.blocks.map((block) => block.type)).toEqual([
      BlockType.Header,
      BlockType.Header,
      BlockType.Text,
    ]);

    useTemplateBuilderStore.getState().moveBlock(headerId, "down");
    expect(useTemplateBuilderStore.getState().template.blocks[1].id).toBe(headerId);

    useTemplateBuilderStore.getState().removeBlock(headerId);
    expect(useTemplateBuilderStore.getState().template.blocks.some((block) => block.id === headerId)).toBe(false);
  });

  it("adds and moves blocks into two-column children", () => {
    const store = useTemplateBuilderStore.getState();
    store.addBlock(BlockType.TwoColumn);
    store.addBlock(BlockType.Text);

    const [twoColumnBlock, textBlock] = useTemplateBuilderStore.getState().template.blocks;
    store.insertBlockInColumn(BlockType.Header, twoColumnBlock.id, "left");
    store.moveBlockToColumn(textBlock.id, twoColumnBlock.id, "right");

    const updatedBlock = useTemplateBuilderStore.getState().template.blocks[0];
    expect(updatedBlock.type).toBe(BlockType.TwoColumn);
    if (updatedBlock.type !== BlockType.TwoColumn) return;
    expect(updatedBlock.content.left).toHaveLength(1);
    expect(updatedBlock.content.left[0].type).toBe(BlockType.Header);
    expect(updatedBlock.content.right.map((block) => block.id)).toEqual([textBlock.id]);
    expect(useTemplateBuilderStore.getState().template.blocks).toHaveLength(1);
  });

  it("supports undo and redo", () => {
    useTemplateBuilderStore.getState().updateTemplateMeta({ name: "First" });
    useTemplateBuilderStore.getState().updateTemplateMeta({ name: "Second" });

    useTemplateBuilderStore.getState().undo();
    expect(useTemplateBuilderStore.getState().template.name).toBe("First");

    useTemplateBuilderStore.getState().redo();
    expect(useTemplateBuilderStore.getState().template.name).toBe("Second");
  });

  it("caps history at 50 entries", () => {
    for (let index = 0; index < 55; index += 1) {
      useTemplateBuilderStore.getState().updateTemplateMeta({ name: `Template ${index}` });
    }

    const state = useTemplateBuilderStore.getState();
    expect(state.history).toHaveLength(50);
    expect(state.historyIndex).toBe(49);
  });

  it("manages variables and preview state", () => {
    const store = useTemplateBuilderStore.getState();
    store.addVariable({ key: "amount", label: "Amount", type: "currency" });
    store.updateVariable("amount", { label: "Invoice amount" });
    store.setPreviewMode(true);
    store.markClean();

    let state = useTemplateBuilderStore.getState();
    expect(state.template.variables).toEqual([{ key: "amount", label: "Invoice amount", type: "currency" }]);
    expect(state.previewMode).toBe(true);
    expect(state.isDirty).toBe(false);

    state.removeVariable("amount");
    state = useTemplateBuilderStore.getState();
    expect(state.template.variables).toEqual([]);
    expect(state.isDirty).toBe(true);
  });
});

function createTemplate(): Template {
  return {
    id: "template-1",
    name: "Template",
    description: "",
    orgId: "org-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    pageSize: "A4",
    orientation: "portrait",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    variables: [],
    blocks: [],
  };
}
