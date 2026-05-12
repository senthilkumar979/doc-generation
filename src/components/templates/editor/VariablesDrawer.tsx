"use client";

import { useMemo, useState } from "react";
import { Copy, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import type { TemplateVariable } from "@/types/template";

import { AddVariableForm } from "./AddVariableForm";
import { VariableRow } from "./VariableRow";
import { buildPayloadShape, validateVariableKey } from "./variables-drawer-utils";

interface VariablesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VariablesDrawer({ open, onOpenChange }: VariablesDrawerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<TemplateVariable>({ key: "", label: "", type: "text", defaultValue: "" });
  const variables = useTemplateEditorStore((state) => state.template.variables);
  const templateId = useTemplateEditorStore((state) => state.template.id);
  const addVariable = useTemplateEditorStore((state) => state.addVariable);
  const removeVariable = useTemplateEditorStore((state) => state.removeVariable);
  const updateVariable = useTemplateEditorStore((state) => state.updateVariable);
  const error = validateVariableKey(draft.key, variables);
  const payloadShape = useMemo(() => buildPayloadShape(templateId, variables), [templateId, variables]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (error || !draft.key || !draft.label) return;
    addVariable({ ...draft, defaultValue: draft.defaultValue || undefined });
    setDraft({ key: "", label: "", type: "text", defaultValue: "" });
    setIsAdding(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Template variables</SheetTitle>
          <SheetDescription>Define the data fields available to this template.</SheetDescription>
        </SheetHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            {variables.length === 0 ? <p className="text-sm text-muted-foreground">No variables yet.</p> : null}
            {variables.map((variable) => (
              <VariableRow
                key={variable.key}
                variable={variable}
                onRemove={() => removeVariable(variable.key)}
                onUpdate={(updates) => updateVariable(variable.key, updates)}
              />
            ))}
          </div>
          {isAdding ? (
            <AddVariableForm draft={draft} error={error} onCancel={() => setIsAdding(false)} onChange={setDraft} onSubmit={onSubmit} />
          ) : (
            <Button variant="outline" size="sm" className="w-full" onClick={() => setIsAdding(true)}>
              <Plus />
              Add Variable
            </Button>
          )}
          <section className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">API payload shape</h3>
              <Button variant="outline" size="xs" onClick={() => void navigator.clipboard.writeText(payloadShape)}>
                <Copy />
                Copy Payload Shape
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-3 text-xs leading-5 text-foreground">
              <code>{payloadShape}</code>
            </pre>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
