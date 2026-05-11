import { upsertOrgBrandImageAction } from '@/actions/upsert-org-brand-image'
import { validateBrandImageFileForUpload } from '@/lib/branding/brand-image-accept'
import { OrgBrandImageRow } from '@/lib/branding/org-brand-schema'
import { notify } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'

export function useBrandingImage() {
  const router = useRouter()
  const [pickError, setPickError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<OrgBrandImageRow | null>(null)
  const [fileRev, setFileRev] = useState(0)
  const [pickPreview, setPickPreview] = useState<{
    src: string
    name: string
  } | null>(null)

  useEffect(() => {
    // eslint-disable-next-line
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
  return {
    pickError,
    error,
    saving,
    editing,
    fileRev,
    pickPreview,
    onSubmit,
    onFilePick,
  }
}
