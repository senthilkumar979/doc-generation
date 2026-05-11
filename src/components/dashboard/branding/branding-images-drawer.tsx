/* eslint-disable @next/next/no-img-element */
'use client'

import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  deleteOrgBrandImageAction,
  upsertOrgBrandImageAction,
} from '@/actions/upsert-org-brand-image'
import type { OrgBrandImageRow } from '@/lib/branding/org-brand-schema'
import {
  BRAND_IMAGE_ACCEPT_ATTR,
  BRAND_IMAGE_MAX_MB,
  validateBrandImageFileForUpload,
} from '@/lib/branding/brand-image-accept'
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
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

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
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editing, setEditing] = useState<OrgBrandImageRow | null>(null)
  const [fileRev, setFileRev] = useState(0)
  const [pickPreview, setPickPreview] = useState<{
    src: string
    name: string
  } | null>(null)
  const [pickError, setPickError] = useState<string | null>(null)

  useEffect(() => {
    setPickError(null)
    setPickPreview((prev) => {
      if (prev?.src.startsWith('blob:')) URL.revokeObjectURL(prev.src)
      return null
    })
  }, [editing?.id, fileRev])

  useEffect(
    () => () => {
      if (pickPreview?.src.startsWith('blob:'))
        URL.revokeObjectURL(pickPreview.src)
    },
    [pickPreview?.src],
  )

  async function onSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    try {
      const result = await upsertOrgBrandImageAction(undefined, formData)
      if ('error' in result) {
        notify.error('Could not save image', { description: result.error })
        setError(result.error)
        return
      }
      notify.success(
        formData.get('id')
          ? 'Additional image updated'
          : 'Additional image added',
      )
      setEditing(null)
      setFileRev((r) => r + 1)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

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

  function onFilePick(event: ChangeEvent<HTMLInputElement>) {
    setPickError(null)
    const file = event.target.files?.[0]
    if (!file) {
      setPickPreview((prev) => {
        if (prev?.src.startsWith('blob:')) URL.revokeObjectURL(prev.src)
        return null
      })
      return
    }
    const invalid = validateBrandImageFileForUpload(file)
    if (invalid) {
      notify.error('Invalid image', { description: invalid })
      setPickError(invalid)
      event.target.value = ''
      setPickPreview((prev) => {
        if (prev?.src.startsWith('blob:')) URL.revokeObjectURL(prev.src)
        return null
      })
      return
    }

    const src = URL.createObjectURL(file)
    setPickPreview((prev) => {
      if (prev?.src.startsWith('blob:')) URL.revokeObjectURL(prev.src)
      return { src, name: file.name }
    })
  }

  const busy = saving || deletingId !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <div className="relative">
          <DialogHeader>
            <DialogTitle>Additional images</DialogTitle>
            <DialogDescription>
              Upload JPEG, JPG, PNG, or SVG (max {BRAND_IMAGE_MAX_MB} MB). After
              you choose a file, a preview appears; click Save to upload.
              Editing keeps the current file until you pick a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {images.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No additional images yet.
              </p>
            ) : null}
            {images.map((image) => (
              <div
                key={image.id}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <img
                  src={image.image_url}
                  alt={image.label || image.image_type}
                  className="size-14 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="truncate font-medium text-foreground">
                    {image.label || 'Untitled image'}
                  </div>
                  <div className="text-muted-foreground capitalize">
                    {image.image_type}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setEditing(image)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="destructive"
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
          <form
            key={`${editing?.id ?? 'new-image'}-${fileRev}`}
            action={onSubmit}
            className="space-y-3 border-t border-border pt-4"
          >
            <input type="hidden" name="id" value={editing?.id ?? ''} />
            <Field
              name="label"
              label="Label"
              defaultValue={editing?.label ?? ''}
            />
            <div className="space-y-2">
              <Label htmlFor="img-imageFile">Image file</Label>
              {pickPreview?.src ?? editing?.image_url ? (
                <img
                  src={pickPreview?.src ?? editing?.image_url ?? ''}
                  alt="Selected or current"
                  className="max-h-24 max-w-full rounded border border-border object-contain"
                />
              ) : null}
              {pickPreview?.name ? (
                <Text className="text-xs text-foreground">
                  {pickPreview.name}
                </Text>
              ) : null}
              <Input
                id="img-imageFile"
                key={`img-file-${editing?.id ?? 'new'}-${fileRev}`}
                name="imageFile"
                type="file"
                accept={BRAND_IMAGE_ACCEPT_ATTR}
                disabled={busy}
                className="cursor-pointer"
                onChange={onFilePick}
              />
              <p className="text-xs text-muted-foreground">
                {pickPreview ? (
                  <>
                    Preview ready — click{' '}
                    <span className="font-medium">
                      {editing ? 'Update image' : 'Add image'}
                    </span>{' '}
                    to upload.
                  </>
                ) : editing ? (
                  'Leave empty to keep the current image.'
                ) : (
                  'Required for a new image.'
                )}
              </p>
              {pickError ? (
                <Text className="text-xs text-destructive" role="alert">
                  {pickError}
                </Text>
              ) : null}
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
                disabled={busy}
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              {editing ? (
                <Button
                  variant="ghost"
                  type="button"
                  disabled={busy}
                  onClick={() => setEditing(null)}
                >
                  Clear
                </Button>
              ) : null}
              <Button type="submit" disabled={busy}>
                {busy && saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner
                      className="size-4 text-primary-foreground"
                      label="Saving"
                    />
                    Saving…
                  </span>
                ) : editing ? (
                  'Update image'
                ) : (
                  'Add image'
                )}
              </Button>
            </DialogFooter>
          </form>
          {busy ? (
            <div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/80 backdrop-blur-sm"
              role="progressbar"
              aria-label={deletingId ? 'Deleting image' : 'Saving to storage'}
            >
              <Spinner
                className="size-10 text-accent"
                label={deletingId ? 'Deleting' : 'Saving'}
              />
              <Text className="text-sm text-muted-foreground">
                {deletingId ? 'Deleting…' : 'Saving to storage…'}
              </Text>
            </div>
          ) : null}
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
    <div className="space-y-1.5">
      <Label htmlFor={`img-${name}`}>{label}</Label>
      <Input
        id={`img-${name}`}
        name={name}
        type="text"
        defaultValue={defaultValue}
      />
    </div>
  )
}
