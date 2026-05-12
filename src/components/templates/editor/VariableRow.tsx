"use client";

import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TemplateVariable } from "@/types/template";

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
          <div className="mt-1 text-sm font-medium">{variable.label}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{variable.type}</Badge>
          <Button variant="ghost" size="xs" onClick={onRemove}>
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Default value</Label>
        <Input value={variable.defaultValue ?? ""} onChange={(event) => onUpdate({ defaultValue: event.target.value })} />
      </div>
    </div>
  );
}
