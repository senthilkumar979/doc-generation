import { BlockType, type Block } from "@/types/template";
import { blockStylesToCss } from "../template-editor-utils";

import type { BlockComponentProps } from "./block-renderer-types";

type TableBlockType = Extract<Block, { type: BlockType.Table }>;

export function TableBlock({ block, previewMode }: BlockComponentProps) {
  const tableBlock = block as TableBlockType;
  const rows = getRows(tableBlock, previewMode);

  return (
    <table className="w-full border-collapse text-sm" style={blockStylesToCss(tableBlock.styles)}>
      {tableBlock.content.showHeader ? (
        <thead style={blockStylesToCss(tableBlock.content.headerStyle)}>
          <tr>
            {tableBlock.content.columns.map((column) => (
              <th key={column.key} className="border border-slate-200 px-2 py-1" style={{ textAlign: column.align }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
      ) : null}
      <tbody>
        {typeof tableBlock.content.rows === "string" && !previewMode ? (
          <tr>
            <td className="border border-slate-200 px-2 py-3 text-center text-slate-500" colSpan={tableBlock.content.columns.length || 1}>
              Dynamic rows — data from {tableBlock.content.rows}
            </td>
          </tr>
        ) : (
          rows.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ backgroundColor: (rowIndex + 1) % 2 === 0 ? tableBlock.content.alternateRowColor : undefined }}>
              {tableBlock.content.columns.map((column) => (
                <td key={column.key} className="border border-slate-200 px-2 py-1" style={{ textAlign: column.align }}>
                  {String(row[column.key] ?? "")}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function getRows(block: TableBlockType, previewMode: boolean): Array<Record<string, string | number | boolean | null>> {
  if (typeof block.content.rows === "string") {
    return previewMode ? [sampleRow(block, 1), sampleRow(block, 2)] : [];
  }
  return block.content.rows.length > 0 ? block.content.rows : [sampleRow(block, 1)];
}

function sampleRow(block: TableBlockType, index: number): Record<string, string> {
  return Object.fromEntries(block.content.columns.map((column) => [column.key, `${column.key} ${index}`]));
}
