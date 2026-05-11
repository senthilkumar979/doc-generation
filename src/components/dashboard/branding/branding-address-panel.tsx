'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { deleteOrgBrandAddressAction } from '@/actions/upsert-org-brand-address'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import type { OrgBrandAddressRow } from '@/lib/branding/org-brand-schema'
import { notify } from '@/lib/toast'

import { BrandingAddressesDialog } from './branding-addresses-dialog'

interface BrandingAddressPanelProps {
  addresses: OrgBrandAddressRow[]
}

export function BrandingAddressPanel({ addresses }: BrandingAddressPanelProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [addressToEdit, setAddressToEdit] = useState<OrgBrandAddressRow | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

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
    notify.success('Address removed', {
      description: 'The address has been removed successfully.',
    })
    router.refresh()
  }

  return (
    <div className="col-span-2">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Addresses</CardTitle>
            <Text muted>
              Multiple postal addresses for invoices, legal docs, and regional
              operations.
            </Text>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAddressToEdit(null)
              setOpenDialog(true)
            }}
          >
            Add address
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {error ? (
            <Text className="text-destructive text-sm" role="alert">
              {error}
            </Text>
          ) : null}
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-md border border-border p-3 text-sm"
            >
              <div className="font-medium text-foreground">
                {address.label || 'Untitled address'}
              </div>
              <div className="mt-1 text-muted-foreground">
                {[
                  address.address_line1,
                  address.city,
                  address.region,
                  address.country,
                ]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setAddressToEdit(address)
                    setOpenDialog(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="destructive"
                  disabled={deletingId === address.id}
                  onClick={() => void onDelete(address.id)}
                >
                  {deletingId === address.id ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <BrandingAddressesDialog
        open={openDialog}
        onOpenChange={(next) => {
          setOpenDialog(next)
          if (!next) setAddressToEdit(null)
        }}
        addresses={addresses}
        seedEditAddressId={addressToEdit?.id ?? null}
      />
    </div>
  )
}
