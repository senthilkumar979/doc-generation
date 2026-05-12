import { describe, expect, it } from "vitest";

import { BlockType, createDefaultBlock, type Block } from "./builder-schema";

describe("createDefaultBlock", () => {
  it("creates an editable block with a uuid for each block type", () => {
    const blocks = Object.values(BlockType).map(createDefaultBlock);

    expect(blocks).toHaveLength(9);
    expect(blocks.map((block) => block.type)).toEqual(Object.values(BlockType));
    blocks.forEach((block) => {
      expect(block.id).toMatch(uuidPattern);
      expect(block.styles).toEqual({});
      expect(block.locked).toBe(false);
    });
  });

  it("returns sensible defaults for content by type", () => {
    expect(createDefaultBlock(BlockType.Header)).toMatchObject({
      type: BlockType.Header,
      content: { text: "Section heading", level: 2 },
    });
    expect(createDefaultBlock(BlockType.Table)).toMatchObject({
      type: BlockType.Table,
      content: {
        columns: [{ key: "name", label: "Name", align: "left" }],
        rows: [],
        showHeader: true,
      },
    });
    expect(createDefaultBlock(BlockType.TwoColumn)).toMatchObject({
      type: BlockType.TwoColumn,
      content: { left: [], right: [], split: "50-50" },
    });
    expect(createDefaultBlock(BlockType.PageBreak)).toMatchObject({
      type: BlockType.PageBreak,
      content: {},
    });
  });

  it("supports discriminated block narrowing", () => {
    const block: Block = createDefaultBlock(BlockType.Signature);

    if (block.type !== BlockType.Signature) throw new Error("Expected a signature block.");

    expect(block.content.showDate).toBe(true);
  });
});

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
