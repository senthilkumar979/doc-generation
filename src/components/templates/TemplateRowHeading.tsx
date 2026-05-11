import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { TemplateRowDto } from "./template-row-dto";

export interface TemplateRowHeadingProps {
  template: TemplateRowDto;
  onEdit: () => void;
  onDelete: () => void;
}

export function TemplateRowHeading({ template, onEdit, onDelete }: TemplateRowHeadingProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 space-y-2">
        <span className="block truncate font-semibold text-foreground text-sm leading-tight tracking-tight">
          {template.name}
        </span>
        <Badge variant="outline" className="max-w-fit normal-case tracking-normal">
          {template.template_type}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" type="button" className="h-8 underline-offset-4 hover:bg-muted/70 hover:underline" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" type="button" className="h-8" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
