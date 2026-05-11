"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { BrandingSection } from "@/actions/upsert-org-brand-profile";
import { upsertOrgBrandProfileSectionAction } from "@/actions/upsert-org-brand-profile";
import { notify } from "@/lib/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FieldConfig {
  name: string;
  label: string;
  multiline?: boolean;
  type?: "text" | "email" | "url";
}

interface BrandingEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  section: BrandingSection;
  fields: FieldConfig[];
  values: Record<string, string>;
}

export function BrandingEditDialog({
  open,
  onOpenChange,
  title,
  description,
  section,
  fields,
  values,
}: BrandingEditDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    formData.set("section", section);
    const result = await upsertOrgBrandProfileSectionAction(undefined, formData);
    setSaving(false);
    if ("error" in result) {
      notify.error("Could not save branding", { description: result.error });
      setError(result.error);
      return;
    }
    if (section === "identity") notify.success("Identity updated");
    else if (section === "colors") notify.success("Brand colors updated");
    else notify.success("Core media URLs updated");
    router.refresh();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={`branding-${field.name}`}>{field.label}</Label>
              {field.multiline ? (
                <Textarea id={`branding-${field.name}`} name={field.name} defaultValue={values[field.name] ?? ""} rows={4} />
              ) : (
                <Input
                  id={`branding-${field.name}`}
                  name={field.name}
                  type={field.type ?? "text"}
                  defaultValue={values[field.name] ?? ""}
                />
              )}
            </div>
          ))}
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
