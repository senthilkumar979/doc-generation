/* eslint-disable @next/next/no-img-element */
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { deleteOrgBrandImageAction } from '@/actions/upsert-org-brand-image'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { OrgBrandImageRow } from '@/lib/branding/org-brand-schema'
import { notify } from '@/lib/toast'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../../ui/drawer'

interface BrandingImagesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: OrgBrandImageRow[]
}

export function BrandingImagesDrawer({
  open,
  onOpenChange,
  images,
}: BrandingImagesDrawerProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editing, setEditing] = useState<OrgBrandImageRow | null>(null)

  async function onDelete(id: string) {
    setDeletingId(id)
    setError(null)
    try {
      const formData = new FormData()
      formData.set('id', id)
      const result = await deleteOrgBrandImageAction(undefined, formData)
      if ('error' in result) {
        notify.error('Could not remove image', { description: result.error })
        setError(result.error)
        return
      }
      notify.success('Additional image removed')
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  const busy = deletingId !== null

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm">Open activity drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Additional images</DrawerTitle>
          <DrawerDescription>
            Manage additional images for your organization.
          </DrawerDescription>
        </DrawerHeader>
        <div className="relative px-6 py-6">
          <div className="space-y-3">
            {images.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/[0.3] px-5 py-10 text-center text-sm italic text-muted-foreground">
                No additional images yet.
              </div>
            ) : null}
            {images.map((image) => (
              <div
                key={image.id}
                className="flex items-center gap-4 rounded-xl border border-border/70 bg-muted/[0.15] p-4 shadow-inner ring-1 ring-black/[0.03] dark:bg-muted/10 dark:ring-white/[0.04]"
              >
                <img
                  src={image.image_url}
                  alt={image.label || image.image_type}
                  className="size-16 shrink-0 rounded-lg border border-border/60 object-cover shadow-sm"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="truncate font-semibold text-foreground">
                    {image.label || 'Untitled image'}
                  </div>
                  <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {image.image_type}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    className="rounded-md"
                    disabled={busy}
                    onClick={() => setEditing(image)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="destructive"
                    className="rounded-md"
                    disabled={busy}
                    onClick={() => void onDelete(image.id)}
                  >
                    {deletingId === image.id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Spinner
                          className="size-3 text-primary-foreground"
                          label="Deleting"
                        />
                        Deleting…
                      </span>
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
