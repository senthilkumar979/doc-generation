"use client";

import { useState } from "react";

import { upsertOrgBrandProfileSectionAction } from "@/actions/upsert-org-brand-profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandingMediaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: { logoUrl: string; iconUrl: string };
}

export function BrandingMediaDrawer({ open, onOpenChange, values }: BrandingMediaDrawerProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    formData.set("section", "media");
    const result = await upsertOrgBrandProfileSectionAction(undefined, formData);
    setSaving(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-auto right-0 bottom-0 left-auto h-[80vh] max-h-[80vh] w-full max-w-[calc(100%-1rem)] translate-x-0 translate-y-0 rounded-b-none sm:top-[50%] sm:right-auto sm:bottom-auto sm:left-[50%] sm:h-auto sm:max-h-none sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-b-xl">
        <DialogHeader>
          <DialogTitle>Brand logo & icon</DialogTitle>
          <DialogDescription>
            Set core brand media used globally. Additional images are managed separately.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <Field name="logoUrl" label="Logo URL" value={values.logoUrl} />
          <Field name="iconUrl" label="Icon URL" value={values.iconUrl} />
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

function Field({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`branding-${name}`}>{label}</Label>
      <Input id={`branding-${name}`} name={name} defaultValue={value} type="url" />
    </div>
  );
}
