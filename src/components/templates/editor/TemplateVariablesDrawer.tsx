"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import type { TemplateVariable } from "@/types/template";

interface TemplateVariablesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type VariableType = TemplateVariable["type"];

export function TemplateVariablesDrawer({ open, onOpenChange }: TemplateVariablesDrawerProps) {
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<VariableType>("text");
  const variables = useTemplateEditorStore((state) => state.template.variables);
  const addVariable = useTemplateEditorStore((state) => state.addVariable);
  const removeVariable = useTemplateEditorStore((state) => state.removeVariable);

  function onAddVariable() {
    if (!key.trim() || !label.trim()) return;
    addVariable({ key: key.trim(), label: label.trim(), type });
    setKey("");
    setLabel("");
    setType("text");
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-[420px] max-w-[calc(100vw-2rem)]">
        <DrawerHeader>
          <DrawerTitle>Template variables</DrawerTitle>
          <DrawerDescription>Variables can be interpolated in text blocks with double braces.</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-border p-3">
            <Field label="Key">
              <Input value={key} placeholder="customerName" onChange={(event) => setKey(event.target.value)} />
            </Field>
            <Field label="Label">
              <Input value={label} placeholder="Customer name" onChange={(event) => setLabel(event.target.value)} />
            </Field>
            <Field label="Type">
              <select
                value={type}
                className="h-10 rounded-md border border-input bg-card px-3 text-sm"
                onChange={(event) => setType(event.target.value as VariableType)}
              >
                {variableTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <Button size="sm" onClick={onAddVariable}>
              Add variable
            </Button>
          </div>
          <div className="space-y-2">
            {variables.map((variable) => (
              <div key={variable.key} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="text-sm font-medium">{variable.label}</div>
                  <div className="text-xs text-muted-foreground">{`{{${variable.key}}}`} · {variable.type}</div>
                </div>
                <Button variant="ghost" size="xs" onClick={() => removeVariable(variable.key)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const variableTypes: VariableType[] = ["text", "number", "date", "currency", "boolean"];
