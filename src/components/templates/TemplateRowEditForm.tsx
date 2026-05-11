import type { FormEvent } from "react";

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
    letter.success && template.template_type === "letter"
      ? letter.data
      : { subject: "", content: "" };

  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded border border-zinc-200 p-3 dark:border-zinc-800">
      <input type="hidden" name="id" value={template.id} />
      <input type="hidden" name="template_type" value={template.template_type} />
      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
        Name
        <input
          name="name"
          type="text"
          required
          minLength={1}
          maxLength={120}
          defaultValue={template.name}
          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      {template.template_type === "letter" ? (
        <>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300" htmlFor={`subject-${template.id}`}>
            Subject
            <input
              id={`subject-${template.id}`}
              name="subject"
              required
              minLength={1}
              maxLength={200}
              defaultValue={defaults.subject}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Body
            <textarea
              name="content"
              required
              minLength={1}
              maxLength={20000}
              rows={4}
              defaultValue={defaults.content}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        </>
      ) : null}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="rounded bg-zinc-900 px-3 py-1 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Save
        </button>
        <button type="button" className="rounded border px-3 py-1 text-xs dark:border-zinc-600" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
