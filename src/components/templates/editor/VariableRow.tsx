"use client";

import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TemplateVariable } from "@/types/template";

import { variableTypes, type VariableType } from "./variables-drawer-utils";

export function VariableRow({
  variable,
  onRemove,
  onUpdate,
}: {
  variable: TemplateVariable;
  onRemove: () => void;
  onUpdate: (updates: Partial<TemplateVariable>) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{variable.key}</code>
          {!variable.label.trim() ? <div className="mt-1 text-xs text-destructive">Details required before saving</div> : null}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{variable.type}</Badge>
          <Button variant="ghost" size="xs" onClick={onRemove}>
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Label</Label>
        <Input value={variable.label} onChange={(event) => onUpdate({ label: event.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Type</Label>
        <select
          className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
          value={variable.type}
          onChange={(event) => onUpdate({ type: event.target.value as VariableType })}
        >
          {variableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Default value</Label>
        <Input value={variable.defaultValue ?? ""} onChange={(event) => onUpdate({ defaultValue: event.target.value })} />
      </div>
    </div>
  );
}
