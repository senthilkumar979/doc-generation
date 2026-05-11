import type { TemplateRowDto } from "./template-row-dto";

export interface TemplateRowHeadingProps {
  template: TemplateRowDto;
  onEdit: () => void;
  onDelete: () => void;
}

export function TemplateRowHeading({ template, onEdit, onDelete }: TemplateRowHeadingProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{template.name}</p>
        <p className="text-xs capitalize text-zinc-500">{template.template_type}</p>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <button type="button" className="underline" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="text-red-600 underline" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
