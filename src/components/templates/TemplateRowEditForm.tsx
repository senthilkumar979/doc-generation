import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { letterPayloadSchema } from "@/lib/templates/payload-schema";

import type { TemplateRowDto } from "./template-row-dto";

export interface TemplateRowEditFormProps {
  template: TemplateRowDto;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onCancel: () => void;
}

export function TemplateRowEditForm({ template, onSubmit, onCancel }: TemplateRowEditFormProps) {
  const letter = letterPayloadSchema.safeParse(template.payload);
  const defaults =
    letter.success && template.template_type === "letter" ? letter.data : { subject: "", content: "" };

  return (
    <Card className="border-dashed bg-muted/20">
      <CardContent className="pt-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <input type="hidden" name="id" value={template.id} />
          <input type="hidden" name="template_type" value={template.template_type} />
          <div className="grid gap-1.5">
            <Label className="text-xs" htmlFor={`name-${template.id}`}>
              Name
            </Label>
            <Input
              id={`name-${template.id}`}
              name="name"
              type="text"
              required
              minLength={1}
              maxLength={120}
              defaultValue={template.name}
              className="text-sm"
            />
          </div>
          {template.template_type === "letter" ? (
            <>
              <div className="grid gap-1.5">
                <Label className="text-xs" htmlFor={`subject-${template.id}`}>
                  Subject
                </Label>
                <Input
                  id={`subject-${template.id}`}
                  name="subject"
                  required
                  minLength={1}
                  maxLength={200}
                  defaultValue={defaults.subject}
                  className="text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs" htmlFor={`content-${template.id}`}>
                  Body
                </Label>
                <Textarea
                  id={`content-${template.id}`}
                  name="content"
                  required
                  minLength={1}
                  maxLength={20000}
                  rows={4}
                  defaultValue={defaults.content}
                  className="text-sm"
                />
              </div>
            </>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" size="sm">
              Save
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
