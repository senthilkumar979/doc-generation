'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

interface BrandingRemovableImageProps {
  src: string
  alt: string
  /** Shown in `window.confirm` before removal. */
  confirmMessage: string
  /** Accessible name for the trash control. */
  removeLabel: string
  onRemove: () => void | Promise<void>
}

export function BrandingRemovableImage({
  src,
  alt,
  confirmMessage,
  removeLabel,
  onRemove,
}: BrandingRemovableImageProps) {
  const [busy, setBusy] = useState(false)

  async function handleRemove() {
    if (!globalThis.confirm?.(confirmMessage)) return
    setBusy(true)
    try {
      await onRemove()
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="group relative inline-flex max-h-24 max-w-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- preview only */}
      <img src={src} alt={alt} className="max-h-24 rounded object-contain" />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        disabled={busy}
        aria-label={removeLabel}
        className="absolute top-[-30px] right-[0px] size-8 opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
        onClick={() => void handleRemove()}
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    </span>
  )
}
