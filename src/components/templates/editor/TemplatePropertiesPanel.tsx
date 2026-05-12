"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import { BlockType, type Block } from "@/types/template";

import { blockTypeLabels } from "./template-editor-utils";

interface TemplatePropertiesPanelProps {
  block: Block | null;
}

export function TemplatePropertiesPanel({ block }: TemplatePropertiesPanelProps) {
  const updateBlockStyles = useTemplateEditorStore((state) => state.updateBlockStyles);

  if (!block) {
    return (
      <aside className="border-l border-border bg-background p-4">
        <h2 className="text-sm font-semibold">Properties</h2>
        <p className="mt-2 text-sm text-muted-foreground">Select a block to edit its content and styles.</p>
      </aside>
    );
  }

  return (
    <aside className="space-y-5 overflow-auto border-l border-border bg-background p-4">
      <div>
        <h2 className="text-sm font-semibold">{blockTypeLabels[block.type]}</h2>
        <p className="mt-1 text-xs text-muted-foreground">Block ID: {block.id.slice(0, 8)}</p>
      </div>
      <BlockContentFields block={block} />
      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground">Styles</h3>
        <Field label="Text color">
          <Input value={block.styles.color ?? ""} onChange={(event) => updateBlockStyles(block.id, { color: event.target.value })} />
        </Field>
        <Field label="Background">
          <Input
            value={block.styles.backgroundColor ?? ""}
            onChange={(event) => updateBlockStyles(block.id, { backgroundColor: event.target.value })}
          />
        </Field>
        <Field label="Font size">
          <Input
            type="number"
            value={block.styles.fontSize ?? ""}
            onChange={(event) => updateBlockStyles(block.id, { fontSize: numberOrUndefined(event.target.value) })}
          />
        </Field>
        <Field label="Padding">
          <Input
            type="number"
            value={block.styles.padding ?? ""}
            onChange={(event) => updateBlockStyles(block.id, { padding: numberOrUndefined(event.target.value) })}
          />
        </Field>
      </div>
    </aside>
  );
}

function BlockContentFields({ block }: { block: Block }) {
  const updateBlockContent = useTemplateEditorStore((state) => state.updateBlockContent);

  switch (block.type) {
    case BlockType.Header:
      return (
        <div className="space-y-3">
          <Field label="Heading text">
            <Input value={block.content.text} onChange={(event) => updateBlockContent(block.id, { text: event.target.value })} />
          </Field>
          <Field label="Level">
            <Input
              type="number"
              min={1}
              max={3}
              value={block.content.level}
              onChange={(event) => updateBlockContent(block.id, { level: Number(event.target.value) as 1 | 2 | 3 })}
            />
          </Field>
        </div>
      );
    case BlockType.Text:
      return (
        <Field label="Text">
          <Textarea value={block.content.text} onChange={(event) => updateBlockContent(block.id, { text: event.target.value })} />
        </Field>
      );
    case BlockType.Image:
      return (
        <div className="space-y-3">
          <Field label="Source">
            <Input value={block.content.src} onChange={(event) => updateBlockContent(block.id, { src: event.target.value })} />
          </Field>
          <Field label="Alt text">
            <Input value={block.content.alt} onChange={(event) => updateBlockContent(block.id, { alt: event.target.value })} />
          </Field>
        </div>
      );
    case BlockType.Divider:
      return (
        <Field label="Color">
          <Input value={block.content.color} onChange={(event) => updateBlockContent(block.id, { color: event.target.value })} />
        </Field>
      );
    case BlockType.Spacer:
      return (
        <Field label="Height">
          <Input type="number" value={block.content.height} onChange={(event) => updateBlockContent(block.id, { height: Number(event.target.value) })} />
        </Field>
      );
    case BlockType.Signature:
      return (
        <Field label="Label">
          <Input value={block.content.label} onChange={(event) => updateBlockContent(block.id, { label: event.target.value })} />
        </Field>
      );
    default:
      return <p className="text-sm text-muted-foreground">This block can be configured from the canvas for now.</p>;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function numberOrUndefined(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}
