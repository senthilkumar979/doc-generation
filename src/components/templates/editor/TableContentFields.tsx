"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import { variableReference } from "@/lib/templates/template-variables";
import { BlockType, type Block } from "@/types/template";

import { ColorInput, Field } from "./properties-panel-fields";

type TableBlock = Extract<Block, { type: BlockType.Table }>;

export function TableContentFields({ block }: { block: TableBlock }) {
  const updateBlockContent = useTemplateEditorStore((state) => state.updateBlockContent);
  const variables = useTemplateEditorStore((state) => state.template.variables);

  function updateColumn(index: number, updates: Partial<TableBlock["content"]["columns"][number]>) {
    updateBlockContent(block.id, { columns: block.content.columns.map((column, i) => (i === index ? { ...column, ...updates } : column)) });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {block.content.columns.map((column, index) => (
          <div key={`${column.key}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input className="h-8 text-xs" value={column.key} placeholder="key" onChange={(event) => updateColumn(index, { key: event.target.value })} />
            <Input className="h-8 text-xs" value={column.label} placeholder="Label" onChange={(event) => updateColumn(index, { label: event.target.value })} />
            <Button variant="ghost" size="xs" onClick={() => updateBlockContent(block.id, { columns: block.content.columns.filter((_, i) => i !== index) })}>
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => updateBlockContent(block.id, { columns: [...block.content.columns, { key: "field", label: "Field", align: "left" }] })}
        >
          <Plus />
          Add column
        </Button>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={block.content.showHeader} onCheckedChange={(checked) => updateBlockContent(block.id, { showHeader: checked === true })} />
        Show header
      </label>
      <Field label="Alternate row color">
        <ColorInput value={block.content.alternateRowColor} onChange={(value) => updateBlockContent(block.id, { alternateRowColor: value ?? "" })} />
      </Field>
      <Field label="Dynamic rows variable">
        <select
          className="h-9 w-full rounded-md border border-input bg-card px-2 text-xs"
          value={typeof block.content.rows === "string" ? block.content.rows : ""}
          onChange={(event) => updateBlockContent(block.id, { rows: event.target.value || [] })}
        >
          <option value="">Static rows</option>
          {variables.map((variable) => (
            <option key={variable.key} value={variableReference(variable.key)}>
              {variable.label || variable.key}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
