"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import { BlockType, type Block } from "@/types/template";

import { ImageContentFields } from "./ImageContentFields";
import { ColorInput, Field, SegmentedControl } from "./properties-panel-fields";
import { TableContentFields } from "./TableContentFields";

export function PropertiesPanelContentTab({ block }: { block: Block }) {
  const updateBlockContent = useTemplateEditorStore((state) => state.updateBlockContent);

  switch (block.type) {
    case BlockType.Header:
      return (
        <div className="space-y-4">
          <Field label="Text">
            <Input value={block.content.text} onChange={(event) => updateBlockContent(block.id, { text: event.target.value })} />
          </Field>
          <Field label="Level">
            <SegmentedControl
              value={`H${block.content.level}` as "H1" | "H2" | "H3"}
              options={headingLevels}
              onChange={(value) => updateBlockContent(block.id, { level: Number(value.slice(1)) as 1 | 2 | 3 })}
            />
          </Field>
        </div>
      );
    case BlockType.Text:
      return <Textarea value={block.content.text} rows={8} onChange={(event) => updateBlockContent(block.id, { text: event.target.value })} />;
    case BlockType.Table:
      return <TableContentFields block={block} />;
    case BlockType.Image:
      return <ImageContentFields block={block} />;
    case BlockType.Divider:
      return (
        <div className="space-y-4">
          <Field label="Thickness">
            <Input type="number" value={block.content.thickness} onChange={(event) => updateBlockContent(block.id, { thickness: Number(event.target.value) })} />
          </Field>
          <Field label="Color">
            <ColorInput value={block.content.color} onChange={(value) => updateBlockContent(block.id, { color: value ?? "#e2e8f0" })} />
          </Field>
        </div>
      );
    case BlockType.Spacer:
      return (
        <Field label="Height (px)">
          <Input type="number" value={block.content.height} onChange={(event) => updateBlockContent(block.id, { height: Number(event.target.value) })} />
        </Field>
      );
    case BlockType.TwoColumn:
      return (
        <Field label="Split ratio">
          <SegmentedControl value={block.content.split} options={splitOptions} onChange={(split) => updateBlockContent(block.id, { split })} />
        </Field>
      );
    case BlockType.Signature:
      return (
        <div className="space-y-4">
          <Field label="Label">
            <Input value={block.content.label} onChange={(event) => updateBlockContent(block.id, { label: event.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={block.content.showDate} onCheckedChange={(checked) => updateBlockContent(block.id, { showDate: checked === true })} />
            Show date
          </label>
        </div>
      );
    case BlockType.PageBreak:
      return <p className="text-sm text-muted-foreground">Page breaks do not have content settings.</p>;
  }
}

const headingLevels = [
  { label: "H1", value: "H1" },
  { label: "H2", value: "H2" },
  { label: "H3", value: "H3" },
] as const;

const splitOptions = [
  { label: "50/50", value: "50-50" },
  { label: "60/40", value: "60-40" },
  { label: "40/60", value: "40-60" },
  { label: "70/30", value: "70-30" },
] as const;
