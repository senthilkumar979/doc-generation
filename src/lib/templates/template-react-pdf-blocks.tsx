import type { ReactElement } from "react";
import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

import { BlockType, type Block, type TemplateVariable } from "@/types/template";

import { blockStylesToReactPDF, formatValue, isRecord } from "./template-react-pdf-utils";

type TemplateData = Record<string, unknown>;

export function TableBlock({
  block,
  data,
  style,
  variables,
}: {
  block: Extract<Block, { type: BlockType.Table }>;
  data: TemplateData;
  style: Style;
  variables: TemplateVariable[];
}) {
  const rows = resolveRows(block, data);
  return (
    <View style={[{ marginBottom: 8 }, style]}>
      {block.content.showHeader ? <TableHeader block={block} /> : null}
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[tableRowStyle, rowIndex % 2 === 1 ? { backgroundColor: block.content.alternateRowColor } : {}]}>
          {block.content.columns.map((column) => (
            <Text key={column.key} style={[tableCellStyle, { textAlign: column.align }]}>
              {formatValue(row[column.key], variables.find((variable) => variable.key === column.key))}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export function TwoColumnBlock({
  block,
  data,
  renderBlock,
  style,
  variables,
}: {
  block: Extract<Block, { type: BlockType.TwoColumn }>;
  data: TemplateData;
  renderBlock: (block: Block, data: TemplateData, variables: TemplateVariable[]) => ReactElement;
  style: Style;
  variables: TemplateVariable[];
}) {
  const [left, right] = splitRatios[block.content.split];
  return (
    <View style={[{ flexDirection: "row", gap: 12, marginBottom: 8 }, style]}>
      <View style={{ flex: left }}>{block.content.left.map((child) => renderBlock(child, data, variables))}</View>
      <View style={{ flex: right }}>{block.content.right.map((child) => renderBlock(child, data, variables))}</View>
    </View>
  );
}

export function SignatureBlock({ block, style }: { block: Extract<Block, { type: BlockType.Signature }>; style: Style }) {
  return (
    <View style={[{ marginTop: 32, gap: 16 }, style]}>
      <View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#111827", height: 28 }} />
        <Text style={{ color: "#475569", fontSize: 9, marginTop: 4 }}>{block.content.label}</Text>
      </View>
      {block.content.showDate ? (
        <View style={{ width: 160 }}>
          <View style={{ borderBottomWidth: 1, borderBottomColor: "#111827", height: 20 }} />
          <Text style={{ color: "#475569", fontSize: 9, marginTop: 4 }}>Date</Text>
        </View>
      ) : null}
    </View>
  );
}

function TableHeader({ block }: { block: Extract<Block, { type: BlockType.Table }> }) {
  return (
    <View style={[tableRowStyle, blockStylesToReactPDF(block.content.headerStyle)]}>
      {block.content.columns.map((column) => (
        <Text key={column.key} style={[tableCellStyle, { textAlign: column.align, fontWeight: "bold" }]}>
          {column.label}
        </Text>
      ))}
    </View>
  );
}

function resolveRows(block: Extract<Block, { type: BlockType.Table }>, data: TemplateData): TemplateData[] {
  if (typeof block.content.rows !== "string") return block.content.rows;

  const key = /^\{\{\s*([^}\s]+)\s*\}\}$/.exec(block.content.rows)?.[1];
  const value = key ? data[key] : null;
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

const tableRowStyle: Style = { flexDirection: "row" };
const tableCellStyle: Style = { borderColor: "#e2e8f0", borderWidth: 1, flex: 1, fontSize: 9, padding: 4 };
const splitRatios: Record<Extract<Block, { type: BlockType.TwoColumn }>["content"]["split"], [number, number]> = {
  "50-50": [1, 1],
  "60-40": [3, 2],
  "40-60": [2, 3],
  "70-30": [7, 3],
};
