'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { upsertOrgBrandAddressAction } from '@/actions/upsert-org-brand-address'
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
import type { OrgBrandAddressRow } from '@/lib/branding/org-brand-schema'
import { notify } from '@/lib/toast'

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
  const [editing, setEditing] = useState<OrgBrandAddressRow | null>(null)

  useEffect(() => {
    if (!open) return
    if (seedEditAddressId !== undefined) {
      // eslint-disable-next-line
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
    notify.success(formData.get('id') ? 'Address updated' : 'Address added', {
      description: formData.get('id')
        ? 'The address has been updated successfully.'
        : 'The address has been added successfully.',
    })
    setEditing(null)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Addresses</DialogTitle>
          <DialogDescription>
            Add, edit, or remove organization addresses.
          </DialogDescription>
        </DialogHeader>
        <form
          key={editing?.id ?? 'new-address'}
          action={onSubmit}
          className="space-y-3 border-t border-border pt-4"
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
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update address' : 'Add address'}
            </Button>
          </DialogFooter>
        </form>
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
    <div className="space-y-1.5">
      <Label htmlFor={`addr-${name}`}>{label}</Label>
      <Input id={`addr-${name}`} name={name} defaultValue={defaultValue} />
    </div>
  )
}
