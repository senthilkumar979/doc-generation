/* eslint-disable @next/next/no-img-element */
import { BrandingRemovableImage } from './branding-removable-image'

interface BrandingSectionCardValueProps {
  label: string
  value: string | null
  onRemove?: () => void | Promise<void>
}

export function isProbablyImageAssetUrl(text: string): boolean {
  if (!/^https?:\/\//i.test(text)) return false
  if (/\.(png|jpe?g|svg)(\?|#|$)/i.test(text)) return true
  if (/\/object\/public\//i.test(text)) return true
  return false
}

export function BrandingSectionCardValue({
  label,
  value,
  onRemove,
}: BrandingSectionCardValueProps) {
  const text = value?.trim()
  if (!text) return <span className="font-medium text-muted-foreground">—</span>

  if (label === 'Primary' || label === 'Secondary' || label === 'Accent') {
    return (
      <span className="inline-flex flex-wrap items-center gap-2.5 font-medium tracking-tight text-foreground">
        <span
          className="size-[1.375rem] shrink-0 rounded-lg border border-border/90 shadow-[inset_0_1px_4px_rgb(255_255_255_/_25%)] ring-2 ring-background"
          style={{ backgroundColor: text }}
          aria-hidden
        />
        <span className="rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[0.8125rem]">
          {text}
        </span>
      </span>
    )
  }

  if ((label === 'Logo' || label === 'Icon' || label === 'Hero') && onRemove) {
    return (
      <BrandingRemovableImage
        src={text}
        alt={`${label} preview`}
        confirmMessage={`Remove this ${label.toLowerCase()} image from branding?`}
        removeLabel={`Remove ${label.toLowerCase()} image`}
        onRemove={onRemove}
      />
    )
  }

  if (label === 'Logo' || label === 'Icon' || label === 'Hero') {
    return (
      <img
        src={text}
        alt={`${label} preview`}
        className="max-h-[4.5rem] max-w-[8.5rem] object-contain"
      />
    )
  }

  if (isProbablyImageAssetUrl(text)) {
    return (
      <img
        src={text}
        alt={`${label} preview`}
        className="max-h-[4.5rem] max-w-[8.5rem] rounded-lg bg-muted/20 object-contain"
      />
    )
  }

  return <span className="truncate font-medium text-foreground">{text}</span>
}
