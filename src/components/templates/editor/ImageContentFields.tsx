"use client";

import { Input } from "@/components/ui/input";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import { BlockType, type Block } from "@/types/template";

import { Field, numberOrUndefined } from "./properties-panel-fields";

type ImageBlock = Extract<Block, { type: BlockType.Image }>;

export function ImageContentFields({ block }: { block: ImageBlock }) {
  const updateBlockContent = useTemplateEditorStore((state) => state.updateBlockContent);
  const variables = useTemplateEditorStore((state) => state.template.variables);

  return (
    <div className="space-y-4">
      <Field label="Image URL">
        <Input value={block.content.src} onChange={(event) => updateBlockContent(block.id, { src: event.target.value })} />
      </Field>
      <Field label="Source variable">
        <select
          className="h-9 w-full rounded-md border border-input bg-card px-2 text-xs"
          value={block.content.src.startsWith("{{") ? block.content.src : ""}
          onChange={(event) => updateBlockContent(block.id, { src: event.target.value })}
        >
          <option value="">None</option>
          {variables.map((variable) => (
            <option key={variable.key} value={`{{${variable.key}}}`}>
              {variable.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Width">
          <Input type="number" value={block.content.width} onChange={(event) => updateBlockContent(block.id, { width: numberOrUndefined(event.target.value) ?? 0 })} />
        </Field>
        <Field label="Height">
          <Input type="number" value={block.content.height} onChange={(event) => updateBlockContent(block.id, { height: numberOrUndefined(event.target.value) ?? 0 })} />
        </Field>
      </div>
    </div>
  );
}
