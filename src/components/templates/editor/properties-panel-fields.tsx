"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function ColorInput({ value, onChange }: { value?: string; onChange: (value: string | undefined) => void }) {
  const safeValue = value && /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <div className="flex gap-2">
      <Input type="color" className="h-9 w-12 p-1" value={safeValue} onChange={(event) => onChange(event.target.value)} />
      <Input className="h-9 text-xs" value={value ?? ""} placeholder="#000000" onChange={(event) => onChange(emptyToUndefined(event.target.value))} />
    </div>
  );
}

export function NumberWithUnit({
  min = 0,
  unit,
  value,
  onChange,
}: {
  min?: number;
  unit: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input className="h-9 text-xs" min={min} type="number" value={value ?? ""} onChange={(event) => onChange(numberOrUndefined(event.target.value))} />
      <span className="w-7 text-xs text-muted-foreground">{unit}</span>
    </div>
  );
}

export function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<{ label: string; value: TValue }>;
  value?: TValue;
  onChange: (value: TValue) => void;
}) {
  return (
    <div className="grid gap-1 rounded-md border border-border bg-muted/40 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          size="xs"
          className={cn("h-7 px-2 text-[0.6875rem]", value === option.value && "bg-card shadow-sm")}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

export function emptyToUndefined(value: string): string | undefined {
  return value.trim() === "" ? undefined : value;
}

export function numberOrUndefined(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}
