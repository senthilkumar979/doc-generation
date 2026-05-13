import { TemplateEditorShell } from "@/components/templates/editor/TemplateEditorShell";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { templateFromApiRow, type TemplateApiRow } from "@/components/templates/editor/template-editor-utils";
import { notFound } from "next/navigation";

interface TemplateEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function TemplateEditPage({ params }: TemplateEditPageProps) {
  const { id } = await params;
  const autoSaveEnabled = process.env.AUTO_SAVE_TEMPLATE === "true";
  const gate = await requireUserWithOrg();
  if (!gate.ok) return <TemplateEditorShell autoSaveEnabled={autoSaveEnabled} templateId={id} />;

  const { data } = await gate.session.supabase
    .from("templates")
    .select("id,name,description,page_size,orientation,schema,created_at,updated_at")
    .eq("id", id)
    .eq("org_id", gate.session.orgId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) notFound();

  return <TemplateEditorShell autoSaveEnabled={autoSaveEnabled} initialTemplate={templateFromApiRow(data as TemplateApiRow)} templateId={id} />;
}
