"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TemplateVariable } from "@/types/template";

import { toCamelCase, variableTypes, type VariableType } from "./variables-drawer-utils";

export function AddVariableForm({
  draft,
  error,
  onCancel,
  onChange,
  onSubmit,
}: {
  draft: TemplateVariable;
  error: string | null;
  onCancel: () => void;
  onChange: (draft: TemplateVariable) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-3 rounded-lg border border-border bg-card p-3" onSubmit={onSubmit}>
      <Field label="Key">
        <Input value={draft.key} placeholder="customerName" onChange={(event) => onChange({ ...draft, key: toCamelCase(event.target.value) })} />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </Field>
      <Field label="Label">
        <Input value={draft.label} placeholder="Customer name" onChange={(event) => onChange({ ...draft, label: event.target.value })} />
      </Field>
      <Field label="Type">
        <select
          className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
          value={draft.type}
          onChange={(event) => onChange({ ...draft, type: event.target.value as VariableType })}
        >
          {variableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Default value">
        <Input value={draft.defaultValue ?? ""} onChange={(event) => onChange({ ...draft, defaultValue: event.target.value })} />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={Boolean(error) || !draft.key || !draft.label}>
          Add
        </Button>
      </div>
    </form>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
