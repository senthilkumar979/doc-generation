import { Input } from "./input"
import { Label } from "./label"

export function Field({
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
