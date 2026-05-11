/* eslint-disable @next/next/no-img-element */
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'

interface BrandingSectionCardProps {
  title: string
  description: string
  rows: Array<{ label: string; value: string | null }>
  /** Shown when `rows` is empty (e.g. optional extras card). */
  emptyText?: string
  isImageCard?: boolean
  onEdit: () => void
}

function isProbablyImageAssetUrl(text: string): boolean {
  if (!/^https?:\/\//i.test(text)) return false
  if (/\.(png|jpe?g|svg)(\?|#|$)/i.test(text)) return true
  if (/\/object\/public\//i.test(text)) return true
  return false
}

export function BrandingSectionCard({
  title,
  description,
  rows,
  emptyText = 'No data available',
  onEdit,
  isImageCard = false,
}: BrandingSectionCardProps) {
  const populated = rows.filter((r) => !!r.value?.trim()).length

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <Text muted>{description}</Text>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          {populated > 0 ? 'Edit' : 'Add'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div
          className={
            isImageCard
              ? 'grid grid-cols-2 items-start gap-3 text-sm'
              : 'space-y-2'
          }
        >
          {rows.map((row) => (
            <div
              key={row.label}
              className={
                isImageCard
                  ? 'flex flex-col gap-2'
                  : 'grid grid-cols-[8rem_1fr] items-start gap-3 text-sm'
              }
            >
              <span className="text-muted-foreground">{row.label}</span>
              <ValueCell label={row.label} value={row.value} />
            </div>
          ))}
        </div>
        {rows.length === 0 ? (
          <Text muted className="text-sm">
            {emptyText}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  )
}

function ValueCell({ label, value }: { label: string; value: string | null }) {
  const text = value?.trim()
  if (!text) return <span className="text-foreground">—</span>

  if (label === 'Primary' || label === 'Secondary' || label === 'Accent') {
    return (
      <span className="inline-flex items-center gap-2 text-foreground">
        <span
          className="size-4 rounded border border-border"
          style={{ backgroundColor: text }}
          aria-hidden
        />
        {text}
      </span>
    )
  }

  if (label === 'Logo' || label === 'Icon' || label === 'Hero') {
    return (
      <img
        src={text}
        alt={`${label} preview`}
        className="max-h-24 rounded object-contain"
      />
    )
  }

  if (isProbablyImageAssetUrl(text)) {
    return (
      <img
        src={text}
        alt={`${label} preview`}
        className="max-h-24 rounded object-contain"
      />
    )
  }

  return <span className="truncate text-foreground">{text}</span>
}
