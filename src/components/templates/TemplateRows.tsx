"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import type { TemplateActionResult } from "@/actions/create-template";
import { deleteTemplateAction } from "@/actions/delete-template";
import { updateTemplateAction } from "@/actions/update-template";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
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
    return <Text muted>No templates yet.</Text>;
  }

  return (
    <div className="space-y-4">
      {actionError ? <Text className="text-destructive text-sm">{actionError}</Text> : null}
      <ul className="divide-y divide-border">
        {templates.map((t) => (
          <li key={t.id} className="space-y-4 py-6 first:pt-0">
            {editId === t.id ? (
              <TemplateRowEditForm template={t} onCancel={() => setEditId(null)} onSubmit={submitUpdate} />
            ) : (
              <TemplateRowHeading template={t} onDelete={() => void submitDelete(t.id)} onEdit={() => setEditId(t.id)} />
            )}
            <PreviewBlock
              parsedLetter={t.template_type === "letter" ? letterPayloadSchema.safeParse(t.payload) : null}
              showPreview={previewId === t.id}
              templateType={t.template_type}
              onToggle={() => setPreviewId(previewId === t.id ? null : t.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PreviewBlockProps {
  templateType: TemplateType;
  parsedLetter: ReturnType<typeof letterPayloadSchema.safeParse> | null;
  showPreview: boolean;
  onToggle: () => void;
}

function PreviewBlock({ templateType, parsedLetter, showPreview, onToggle }: PreviewBlockProps) {
  if (templateType === "letter" && parsedLetter?.success) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" type="button" className="-ml-3 h-auto px-3 underline-offset-4 hover:underline" onClick={onToggle}>
          {showPreview ? "Hide PDF preview" : "Show PDF preview"}
        </Button>
        {showPreview ? <LetterPdfPreview payload={parsedLetter.data} /> : null}
      </div>
    );
  }

  if (templateType === "letter" && parsedLetter && !parsedLetter.success) {
    return <Text className="text-destructive text-xs">Stored letter payload failed validation.</Text>;
  }

  return (
    <Text muted className="text-xs leading-relaxed">
      Blank templates have nothing to preview yet.
    </Text>
  );
}
