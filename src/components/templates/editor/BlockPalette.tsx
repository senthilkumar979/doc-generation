"use client";

import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import type { Template } from "@/types/template";

import { paletteGroups, type PaletteItem } from "./block-palette-data";

export function BlockPalette() {
  const template = useTemplateEditorStore((state) => state.template);
  const addBlock = useTemplateEditorStore((state) => state.addBlock);
  const updateTemplateMeta = useTemplateEditorStore((state) => state.updateTemplateMeta);

  return (
    <aside className="overflow-auto border-r border-border bg-background p-3">
      <div className="px-1 pb-2">
        <h2 className="text-sm font-semibold">Block palette</h2>
        <p className="mt-1 text-xs text-muted-foreground">Click to append or drag into the page.</p>
      </div>
      <Accordion type="multiple" defaultValue={paletteGroups.map((group) => group.title)} className="border-t border-border/70">
        {paletteGroups.map((group) => (
          <AccordionItem key={group.title} value={group.title}>
            <AccordionTrigger className="py-2 text-xs uppercase tracking-wide text-muted-foreground">{group.title}</AccordionTrigger>
            <AccordionContent className="space-y-1.5">
              {group.items.map((item) => (
                <PaletteBlock key={item.type} item={item} onAdd={() => addBlock(item.type)} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <PageSettings template={template} onUpdate={updateTemplateMeta} />
    </aside>
  );
}

function PaletteBlock({ item, onAdd }: { item: PaletteItem; onAdd: () => void }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      draggable
      className="focus-ring flex w-full cursor-grab gap-2 rounded-lg border border-border bg-card p-2 text-left transition-colors hover:bg-muted"
      onClick={onAdd}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("application/x-template-block", item.type);
        event.dataTransfer.setData("text/plain", item.type);
      }}
    >
      <span className="mt-0.5 rounded-md bg-muted p-1.5 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-foreground">{item.label}</span>
        <span className="block truncate text-[0.6875rem] leading-4 text-muted-foreground">{item.description}</span>
      </span>
      <GripVertical className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
    </button>
  );
}

function PageSettings({
  template,
  onUpdate,
}: {
  template: Template;
  onUpdate: ReturnType<typeof useTemplateEditorStore.getState>["updateTemplateMeta"];
}) {
  return (
    <section className="mt-4 space-y-3 border-t border-border/70 pt-4">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Page Settings</h3>
      <Field label="Page size">
        <select
          className="h-8 w-full rounded-md border border-input bg-card px-2 text-xs"
          value={template.pageSize}
          onChange={(event) => onUpdate({ pageSize: event.target.value as "A4" | "Letter" | "Legal" })}
        >
          {["A4", "Letter", "Legal"].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Orientation">
        <div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-muted/40 p-1">
          {(["portrait", "landscape"] as const).map((orientation) => (
            <button
              key={orientation}
              type="button"
              className={cn("rounded px-2 py-1 text-xs capitalize", template.orientation === orientation && "bg-card shadow-sm")}
              onClick={() => onUpdate({ orientation })}
            >
              {orientation}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        {(["top", "bottom", "left", "right"] as const).map((side) => (
          <Field key={side} label={side}>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                className="h-8 px-2 text-xs"
                value={template.margins[side]}
                onChange={(event) => onUpdate({ margins: { ...template.margins, [side]: Number(event.target.value) } })}
              />
              <span className="text-[0.6875rem] text-muted-foreground">mm</span>
            </div>
          </Field>
        ))}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[0.6875rem] capitalize text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
