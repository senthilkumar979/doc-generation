"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import type { Block } from "@/types/template";

import { PropertiesPanelContentTab } from "./PropertiesPanelContentTab";
import { PropertiesPanelStyleTab } from "./PropertiesPanelStyleTab";
import { blockTypeLabels } from "./template-editor-utils";

interface PropertiesPanelProps {
  block: Block | null;
  onOpenVariables: () => void;
}

export function PropertiesPanel({ block, onOpenVariables }: PropertiesPanelProps) {
  const variables = useTemplateEditorStore((state) => state.template.variables);

  if (!block) {
    return (
      <aside className="space-y-5 overflow-auto border-l border-border bg-background p-4">
        <div>
          <h2 className="text-sm font-semibold">Properties</h2>
          <p className="mt-2 text-sm text-muted-foreground">Select a block to edit its properties</p>
        </div>
        <section className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Variables</h3>
            <Button variant="outline" size="xs" onClick={onOpenVariables}>
              Edit Variables
            </Button>
          </div>
          {variables.length === 0 ? (
            <p className="text-xs text-muted-foreground">No variables yet.</p>
          ) : (
            <div className="space-y-2">
              {variables.map((variable) => (
                <div key={variable.key} className="rounded-md border border-border bg-card p-2">
                  <div className="text-xs font-medium">{variable.label}</div>
                  <div className="text-[0.6875rem] text-muted-foreground">{`{{${variable.key}}}`} · {variable.type}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </aside>
    );
  }

  return (
    <aside className="overflow-auto border-l border-border bg-background p-4">
      <div>
        <h2 className="text-sm font-semibold">{blockTypeLabels[block.type]}</h2>
        <p className="mt-1 text-xs text-muted-foreground">Block ID: {block.id.slice(0, 8)}</p>
      </div>
      <Tabs defaultValue="content" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <PropertiesPanelContentTab block={block} />
        </TabsContent>
        <TabsContent value="style">
          <PropertiesPanelStyleTab block={block} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
