"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import type { TemplateActionResult } from "@/actions/create-template";
import { deleteTemplateAction } from "@/actions/delete-template";
import { updateTemplateAction } from "@/actions/update-template";
import type { TemplateType } from "@/lib/templates/constants";
import { letterPayloadSchema } from "@/lib/templates/payload-schema";

import { LetterPdfPreview } from "./LetterPdfPreview";
import type { TemplateRowDto } from "./template-row-dto";
import { TemplateRowEditForm } from "./TemplateRowEditForm";
import { TemplateRowHeading } from "./TemplateRowHeading";

interface TemplateRowsProps {
  templates: TemplateRowDto[];
}

export function TemplateRows({ templates }: TemplateRowsProps) {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setActionError(null);
    const result: TemplateActionResult = await updateTemplateAction(undefined, new FormData(form));
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setEditId(null);
    router.refresh();
  }

  async function submitDelete(id: string) {
    if (!globalThis.confirm?.("Delete this template? This cannot be undone.")) return;
    setActionError(null);
    const fd = new FormData();
    fd.set("id", id);
    const result = await deleteTemplateAction(undefined, fd);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setPreviewId(null);
    setEditId(null);
    router.refresh();
  }

  if (templates.length === 0) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">No templates yet.</p>;
  }

  return (
    <div className="space-y-4">
      {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {templates.map((t) => (
          <TemplateListItem
            key={t.id}
            template={t}
            editId={editId}
            previewId={previewId}
            onDelete={() => void submitDelete(t.id)}
            onEdit={() => setEditId(t.id)}
            onPreviewToggle={() => setPreviewId(previewId === t.id ? null : t.id)}
            onSubmitUpdate={submitUpdate}
            onCancelEdit={() => setEditId(null)}
          />
        ))}
      </ul>
    </div>
  );
}

interface TemplateListItemProps {
  template: TemplateRowDto;
  editId: string | null;
  previewId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onPreviewToggle: () => void;
  onSubmitUpdate: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onCancelEdit: () => void;
}

function TemplateListItem({
  template: t,
  editId,
  previewId,
  onEdit,
  onDelete,
  onPreviewToggle,
  onSubmitUpdate,
  onCancelEdit,
}: TemplateListItemProps) {
  const parsedLetter = t.template_type === "letter" ? letterPayloadSchema.safeParse(t.payload) : null;

  return (
    <li className="space-y-3 py-5">
      {editId === t.id ? (
        <TemplateRowEditForm template={t} onCancel={onCancelEdit} onSubmit={onSubmitUpdate} />
      ) : (
        <TemplateRowHeading template={t} onDelete={onDelete} onEdit={onEdit} />
      )}
      <PreviewBlock
        templateType={t.template_type}
        parsedLetter={parsedLetter}
        showPreview={previewId === t.id}
        onToggle={onPreviewToggle}
      />
    </li>
  );
}

function PreviewBlock({
  templateType,
  parsedLetter,
  showPreview,
  onToggle,
}: {
  templateType: TemplateType;
  parsedLetter: ReturnType<typeof letterPayloadSchema.safeParse> | null;
  showPreview: boolean;
  onToggle: () => void;
}) {
  if (templateType === "letter" && parsedLetter?.success) {
    return (
      <div>
        <button
          type="button"
          className="text-sm font-medium text-zinc-900 underline dark:text-zinc-50"
          onClick={onToggle}
        >
          {showPreview ? "Hide PDF preview" : "Show PDF preview"}
        </button>
        {showPreview ? <LetterPdfPreview payload={parsedLetter.data} /> : null}
      </div>
    );
  }

  if (templateType === "letter" && parsedLetter && !parsedLetter.success) {
    return <p className="text-xs text-red-600">Stored letter payload failed validation.</p>;
  }

  return <p className="text-xs text-zinc-500">Blank templates have nothing to preview yet.</p>;
}
