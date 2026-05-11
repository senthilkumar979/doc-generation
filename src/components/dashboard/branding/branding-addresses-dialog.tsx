'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  deleteOrgBrandAddressAction,
  upsertOrgBrandAddressAction,
} from '@/actions/upsert-org-brand-address'
import type { OrgBrandAddressRow } from '@/lib/branding/org-brand-schema'
import { notify } from '@/lib/toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BrandingAddressesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addresses: OrgBrandAddressRow[]
  /** When set, seeds the form when the dialog opens (e.g. from `BrandingAddressPanel`). Omit for settings flow. */
  seedEditAddressId?: string | null
}

export function BrandingAddressesDialog({
  open,
  onOpenChange,
  addresses,
  seedEditAddressId,
}: BrandingAddressesDialogProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editing, setEditing] = useState<OrgBrandAddressRow | null>(null)

  useEffect(() => {
    if (!open) return
    if (seedEditAddressId !== undefined) {
      setEditing(
        seedEditAddressId
          ? addresses.find((a) => a.id === seedEditAddressId) ?? null
          : null,
      )
      return
    }
    setEditing(null)
  }, [open, seedEditAddressId, addresses])

  async function onSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    const result = await upsertOrgBrandAddressAction(undefined, formData)
    setSaving(false)
    if ('error' in result) {
      notify.error('Could not save address', { description: result.error })
      setError(result.error)
      return
    }
    notify.success(formData.get('id') ? 'Address updated' : 'Address added')
    setEditing(null)
    router.refresh()
  }

  async function onDelete(id: string) {
    setDeletingId(id)
    setError(null)
    const formData = new FormData()
    formData.set('id', id)
    const result = await deleteOrgBrandAddressAction(undefined, formData)
    setDeletingId(null)
    if ('error' in result) {
      notify.error('Could not remove address', { description: result.error })
      setError(result.error)
      return
    }
    notify.success('Address removed')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto rounded-2xl border-border/75 p-0 sm:max-w-2xl">
        <div className="relative border-b border-border/60 bg-muted/[0.35] px-6 py-5">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
            aria-hidden
          />
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Addresses
            </DialogTitle>
            <DialogDescription className="text-[0.8125rem] leading-relaxed">
              Add, edit, or remove organization addresses.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="space-y-4 px-6 py-6">
          <form
            key={editing?.id ?? 'new-address'}
            action={onSubmit}
            className="space-y-4"
          >
            <input type="hidden" name="id" value={editing?.id ?? ''} />
            <Field
              name="label"
              label="Label"
              defaultValue={editing?.label ?? ''}
            />
            <Field
              name="addressLine1"
              label="Address line 1"
              defaultValue={editing?.address_line1 ?? ''}
            />
            <Field
              name="addressLine2"
              label="Address line 2"
              defaultValue={editing?.address_line2 ?? ''}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                name="city"
                label="City"
                defaultValue={editing?.city ?? ''}
              />
              <Field
                name="region"
                label="Region"
                defaultValue={editing?.region ?? ''}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                name="postalCode"
                label="Postal code"
                defaultValue={editing?.postal_code ?? ''}
              />
              <Field
                name="country"
                label="Country"
                defaultValue={editing?.country ?? ''}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isPrimary"
                type="checkbox"
                name="isPrimary"
                value="true"
                defaultChecked={editing?.is_primary ?? false}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="isPrimary">Set as primary address</Label>
            </div>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter className="border-t border-border/60 pt-4 sm:justify-end">
              <Button
                variant="outline"
                type="button"
                className="rounded-lg"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                type="submit"
                className="rounded-lg font-semibold shadow-sm"
                disabled={saving}
              >
                {saving
                  ? 'Saving…'
                  : editing
                  ? 'Update address'
                  : 'Add address'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  name,
  label,
  defaultValue = '',
}: {
  name: string
  label: string
  defaultValue?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`addr-${name}`}>{label}</Label>
      <Input id={`addr-${name}`} name={name} defaultValue={defaultValue} />
    </div>
  )
}
