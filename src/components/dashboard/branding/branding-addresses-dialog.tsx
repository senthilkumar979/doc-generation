"use client";

import { useState } from "react";

import { deleteOrgBrandAddressAction, upsertOrgBrandAddressAction } from "@/actions/upsert-org-brand-address";
import type { OrgBrandAddressRow } from "@/lib/branding/org-brand-schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandingAddressesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: OrgBrandAddressRow[];
}

export function BrandingAddressesDialog({ open, onOpenChange, addresses }: BrandingAddressesDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<OrgBrandAddressRow | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await upsertOrgBrandAddressAction(undefined, formData);
    setSaving(false);
    if ("error" in result) setError(result.error);
  }

  async function onDelete(id: string) {
    setDeletingId(id);
    setError(null);
    const formData = new FormData();
    formData.set("id", id);
    const result = await deleteOrgBrandAddressAction(undefined, formData);
    setDeletingId(null);
    if ("error" in result) setError(result.error);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Addresses</DialogTitle>
          <DialogDescription>Add, edit, or remove organization addresses.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {addresses.length === 0 ? <p className="text-sm text-muted-foreground">No addresses yet.</p> : null}
          {addresses.map((address) => (
            <div key={address.id} className="rounded-md border border-border p-3 text-sm">
              <div className="font-medium text-foreground">{address.label || "Untitled address"}</div>
              <div className="mt-1 text-muted-foreground">
                {[address.address_line1, address.city, address.region, address.country].filter(Boolean).join(", ") || "—"}
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <Button size="xs" variant="outline" onClick={() => setEditing(address)}>
                  Edit
                </Button>
                <Button size="xs" variant="destructive" disabled={deletingId === address.id} onClick={() => void onDelete(address.id)}>
                  {deletingId === address.id ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <form key={editing?.id ?? "new-address"} action={onSubmit} className="space-y-3 border-t border-border pt-4">
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <Field name="label" label="Label" defaultValue={editing?.label ?? ""} />
          <Field name="addressLine1" label="Address line 1" defaultValue={editing?.address_line1 ?? ""} />
          <Field name="addressLine2" label="Address line 2" defaultValue={editing?.address_line2 ?? ""} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="city" label="City" defaultValue={editing?.city ?? ""} />
            <Field name="region" label="Region" defaultValue={editing?.region ?? ""} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="postalCode" label="Postal code" defaultValue={editing?.postal_code ?? ""} />
            <Field name="country" label="Country" defaultValue={editing?.country ?? ""} />
          </div>
          <div className="flex items-center gap-2">
            <input id="isPrimary" type="checkbox" name="isPrimary" value="true" defaultChecked={editing?.is_primary ?? false} className="size-4 rounded border-input" />
            <Label htmlFor="isPrimary">Set as primary address</Label>
          </div>
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
              {saving ? "Saving…" : editing ? "Update address" : "Add address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ name, label, defaultValue = "" }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`addr-${name}`}>{label}</Label>
      <Input id={`addr-${name}`} name={name} defaultValue={defaultValue} />
    </div>
  );
}
