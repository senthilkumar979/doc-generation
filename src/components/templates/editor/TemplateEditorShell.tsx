"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { updateBuilderTemplateAction } from "@/actions/update-builder-template";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import type { Template } from "@/types/template";

import { Canvas } from "./Canvas";
import { TemplateEditorLoading } from "./TemplateEditorLoading";
import { TemplateEditorTopBar } from "./TemplateEditorTopBar";
import { BlockPalette } from "./BlockPalette";
import { TemplatePropertiesPanel } from "./TemplatePropertiesPanel";
import { TemplateVariablesDrawer } from "./TemplateVariablesDrawer";
import { findBlockById, templateFromApiRow, type TemplateApiRow } from "./template-editor-utils";

interface TemplateEditorShellProps {
  initialTemplate?: Template;
  templateId: string;
}

type LoadStatus = "loading" | "ready" | "error";

export function TemplateEditorShell({ initialTemplate, templateId }: TemplateEditorShellProps) {
  const [status, setStatus] = useState<LoadStatus>(initialTemplate ? "ready" : "loading");
  const [error, setError] = useState<string | null>(null);
  const [variablesOpen, setVariablesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const template = useTemplateEditorStore((state) => state.template);
  const selectedBlockId = useTemplateEditorStore((state) => state.selectedBlockId);
  const isDirty = useTemplateEditorStore((state) => state.isDirty);
  const setTemplate = useTemplateEditorStore((state) => state.setTemplate);
  const markClean = useTemplateEditorStore((state) => state.markClean);

  const selectedBlock = useMemo(() => findBlockById(template.blocks, selectedBlockId), [selectedBlockId, template.blocks]);

  const saveTemplate = useCallback(
    async (templateToSave: Template) => {
      setIsSaving(true);
      setError(null);
      try {
        const result = await updateBuilderTemplateAction(templateId, templateToSave);
        if (result.error) throw new Error(result.error);
        markClean();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save template.");
      } finally {
        setIsSaving(false);
      }
    },
    [markClean, templateId],
  );

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
      return;
    }

    let ignore = false;
    async function loadTemplate() {
      try {
        const response = await fetch(`/api/v1/templates/${templateId}`);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? "Could not load template.");
        if (ignore) return;
        setTemplate(templateFromApiRow(payload.data as TemplateApiRow));
        setStatus("ready");
      } catch (err) {
        if (ignore) return;
        setError(err instanceof Error ? err.message : "Could not load template.");
        setStatus("error");
      }
    }
    void loadTemplate();
    return () => {
      ignore = true;
    };
  }, [initialTemplate, setTemplate, templateId]);

  useEffect(() => {
    if (!isDirty || status !== "ready") return;
    const timeoutId = window.setTimeout(() => void saveTemplate(useTemplateEditorStore.getState().template), 2_000);
    return () => window.clearTimeout(timeoutId);
  }, [isDirty, saveTemplate, status, template]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!useTemplateEditorStore.getState().isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  if (status === "loading") return <TemplateEditorLoading />;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-muted/[0.22]">
      <TemplateEditorTopBar isSaving={isSaving} onOpenVariables={() => setVariablesOpen(true)} onSave={() => void saveTemplate(template)} />
      {error ? <div className="border-b border-border bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div> : null}
      <div className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)_280px]">
        <BlockPalette />
        <Canvas />
        <TemplatePropertiesPanel block={selectedBlock} />
      </div>
      <TemplateVariablesDrawer open={variablesOpen} onOpenChange={setVariablesOpen} />
    </div>
  );
}
