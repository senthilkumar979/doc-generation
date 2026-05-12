import { BlockType, type Block } from "./builder-types";

export function createDefaultBlock(type: BlockType): Block {
  const base = createBaseBlock();

  switch (type) {
    case BlockType.Header:
      return { ...base, type, content: { text: "Section heading", level: 2 } };
    case BlockType.Text:
      return { ...base, type, content: { text: "Add body text with {{variableName}} values." } };
    case BlockType.Table:
      return {
        ...base,
        type,
        content: {
          columns: [{ key: "name", label: "Name", align: "left" }],
          rows: [],
          showHeader: true,
          alternateRowColor: "#f8fafc",
          headerStyle: { backgroundColor: "#f1f5f9", fontWeight: "semibold" },
        },
      };
    case BlockType.Image:
      return {
        ...base,
        type,
        content: { src: "", alt: "Template image", width: 160, height: 90, objectFit: "contain" },
      };
    case BlockType.Divider:
      return { ...base, type, content: { thickness: 1, color: "#e2e8f0" } };
    case BlockType.Spacer:
      return { ...base, type, content: { height: 16 } };
    case BlockType.TwoColumn:
      return { ...base, type, content: { left: [], right: [], split: "50-50" } };
    case BlockType.Signature:
      return { ...base, type, content: { label: "Signature", showDate: true } };
    case BlockType.PageBreak:
      return { ...base, type, content: {} };
  }
}

function createBaseBlock(): Pick<Block, "id" | "styles" | "locked"> {
  return {
    id: crypto.randomUUID(),
    styles: {},
    locked: false,
  };
}
