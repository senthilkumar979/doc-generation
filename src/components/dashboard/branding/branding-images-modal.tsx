import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { BRAND_IMAGE_ACCEPT_ATTR, BRAND_IMAGE_MAX_MB } from '@/lib/branding/brand-image-accept'
import { Label } from '@radix-ui/react-label'
import { useBrandingImage } from './useBrandingImage'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '../../ui/drawer'

interface BrandingImagesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BrandingImagesModal({
  open,
  onOpenChange,
}: BrandingImagesModalProps) {
  const {
    pickError,
    error,
    saving,
    editing,
    fileRev,
    pickPreview,
    onSubmit,
    onFilePick,
  } = useBrandingImage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto rounded-2xl border-border/75 p-0 sm:max-w-3xl">
        <div className="relative border-b border-border/60 bg-muted/[0.35] px-6 py-5">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
            aria-hidden
          />
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              
            </DialogTitle>
            <DialogDescription className="text-[0.8125rem] leading-relaxed">
              Upload JPEG, JPG, PNG, or SVG (max {BRAND_IMAGE_MAX_MB} MB). After
              you choose a file, a preview appears; click Save to upload.
              Editing keeps the current file until you pick a new one.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="relative px-6 py-6">
          <form
            key={`${editing?.id ?? 'new-image'}-${fileRev}`}
            action={onSubmit}
            className="mt-6 space-y-4 border-t border-border/60 pt-6"
          >
            <input type="hidden" name="id" value={editing?.id ?? ''} />
            <Field
              name="label"
              label="Label"
              defaultValue={editing?.label ?? ''}
            />
            <div className="space-y-1.5">
              <Label htmlFor="img-imageType">Image type</Label>
              <select
                id="img-imageType"
                name="imageType"
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                defaultValue={editing?.image_type ?? 'general'}
              >
                <option value="general">General</option>
                <option value="hero">Hero</option>
                <option value="banner">Banner</option>
                <option value="cover">Cover</option>
              </select>
            </div>
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
                disabled={saving}
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
            <DialogFooter className="border-t border-border/60 pt-4 sm:justify-end">
              <Button
                variant="outline"
                type="button"
                className="rounded-lg"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                type="submit"
                className="rounded-lg font-semibold shadow-sm"
                disabled={saving}
              >
                {saving ? (
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
          {saving ? (
            <div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm"
              role="progressbar"
              aria-label="Saving to storage"
            >
              <Spinner className="size-10 text-accent" label="Saving" />
              <Text className="text-sm text-muted-foreground">
                Saving to storage…
              </Text>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
