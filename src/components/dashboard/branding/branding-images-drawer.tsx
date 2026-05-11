/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteOrgBrandImageAction, upsertOrgBrandImageAction } from "@/actions/upsert-org-brand-image";
import type { OrgBrandImageRow } from "@/lib/branding/org-brand-schema";
import { notify } from "@/lib/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandingImagesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: OrgBrandImageRow[];
}

export function BrandingImagesDrawer({ open, onOpenChange, images }: BrandingImagesDrawerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<OrgBrandImageRow | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await upsertOrgBrandImageAction(undefined, formData);
    setSaving(false);
    if ("error" in result) {
      notify.error("Could not save image", { description: result.error });
      setError(result.error);
      return;
    }
    notify.success(formData.get("id") ? "Additional image updated" : "Additional image added");
    setEditing(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    setDeletingId(id);
    setError(null);
    const formData = new FormData();
    formData.set("id", id);
    const result = await deleteOrgBrandImageAction(undefined, formData);
    setDeletingId(null);
    if ("error" in result) {
      notify.error("Could not remove image", { description: result.error });
      setError(result.error);
      return;
    }
    notify.success("Additional image removed");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-auto right-0 bottom-0 left-auto h-[82vh] max-h-[82vh] w-full max-w-[calc(100%-1rem)] translate-x-0 translate-y-0 overflow-y-auto rounded-b-none sm:top-[50%] sm:right-auto sm:bottom-auto sm:left-[50%] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-b-xl">
        <DialogHeader>
          <DialogTitle>Additional images</DialogTitle>
          <DialogDescription>Manage non-logo/icon brand images (hero, banner, cover, general).</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {images.length === 0 ? <p className="text-sm text-muted-foreground">No additional images yet.</p> : null}
          {images.map((image) => (
            <div key={image.id} className="flex items-center gap-3 rounded-md border border-border p-3">
              <img src={image.image_url} alt={image.label || image.image_type} className="size-12 rounded object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <div className="truncate font-medium text-foreground">{image.label || "Untitled image"}</div>
                <div className="truncate text-muted-foreground">
                  {image.image_type} - {image.image_url}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="xs" variant="outline" onClick={() => setEditing(image)}>
                  Edit
                </Button>
                <Button size="xs" variant="destructive" disabled={deletingId === image.id} onClick={() => void onDelete(image.id)}>
                  {deletingId === image.id ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <form key={editing?.id ?? "new-image"} action={onSubmit} className="space-y-3 border-t border-border pt-4">
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <Field name="label" label="Label" defaultValue={editing?.label ?? ""} />
          <div className="space-y-1.5">
            <Label htmlFor="img-imageType">Image type</Label>
            <select
              id="img-imageType"
              name="imageType"
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
              defaultValue={editing?.image_type ?? "general"}
            >
              <option value="general">General</option>
              <option value="hero">Hero</option>
              <option value="banner">Banner</option>
              <option value="cover">Cover</option>
            </select>
          </div>
          <Field name="imageUrl" label="Image URL" type="url" defaultValue={editing?.image_url ?? ""} />
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {editing ? (
              <Button variant="ghost" type="button" onClick={() => setEditing(null)}>
                Clear
              </Button>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update image" : "Add image"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue = "",
}: {
  name: string;
  label: string;
  type?: "text" | "url";
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`img-${name}`}>{label}</Label>
      <Input id={`img-${name}`} name={name} type={type} defaultValue={defaultValue} />
    </div>
  );
}
