"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { updateBuilderTemplateAction } from "@/actions/update-builder-template";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";
import { getIncompleteVariables } from "@/lib/templates/template-variables";
import type { Template } from "@/types/template";

import { Canvas } from "./Canvas";
import { TemplateEditorLoading } from "./TemplateEditorLoading";
import { TemplateEditorTopBar } from "./TemplateEditorTopBar";
import { BlockPalette } from "./BlockPalette";
import { PropertiesPanel } from "./PropertiesPanel";
import { VariablesDrawer } from "./VariablesDrawer";
import { findBlockById, templateFromApiRow, type TemplateApiRow } from "./template-editor-utils";

interface TemplateEditorShellProps {
  autoSaveEnabled?: boolean;
  initialTemplate?: Template;
  templateId: string;
}

type LoadStatus = "loading" | "ready" | "error";

export function TemplateEditorShell({ autoSaveEnabled = false, initialTemplate, templateId }: TemplateEditorShellProps) {
  const [status, setStatus] = useState<LoadStatus>(initialTemplate ? "ready" : "loading");
  const [error, setError] = useState<string | null>(null);
  const [variablesOpen, setVariablesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveRetryKey, setSaveRetryKey] = useState(0);
  const hydratedTemplateIdRef = useRef<string | null>(null);
  const lastSavedSnapshotRef = useRef(initialTemplate ? serializeTemplate(initialTemplate) : "");
  const saveInFlightRef = useRef(false);
  const hasQueuedSaveRef = useRef(false);
  const template = useTemplateEditorStore((state) => state.template);
  const selectedBlockId = useTemplateEditorStore((state) => state.selectedBlockId);
  const isDirty = useTemplateEditorStore((state) => state.isDirty);
  const setTemplate = useTemplateEditorStore((state) => state.setTemplate);
  const markClean = useTemplateEditorStore((state) => state.markClean);

  const selectedBlock = useMemo(() => findBlockById(template.blocks, selectedBlockId), [selectedBlockId, template.blocks]);

  const saveTemplate = useCallback(
    async (templateToSave: Template) => {
      const incompleteVariables = getIncompleteVariables(templateToSave.variables);
      if (incompleteVariables.length > 0) {
        setVariablesOpen(true);
        setError(`Fill variable details before saving: ${incompleteVariables.map((variable) => variable.key).join(", ")}.`);
        return;
      }

      const snapshot = serializeTemplate(templateToSave);
      if (snapshot === lastSavedSnapshotRef.current) {
        markClean();
        return;
      }
      if (saveInFlightRef.current) {
        hasQueuedSaveRef.current = true;
        return;
      }

      saveInFlightRef.current = true;
      setIsSaving(true);
      setError(null);
      try {
        const result = await updateBuilderTemplateAction(templateId, templateToSave);
        if (result.error) throw new Error(result.error);
        lastSavedSnapshotRef.current = snapshot;
        if (serializeTemplate(useTemplateEditorStore.getState().template) === snapshot) markClean();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save template.");
      } finally {
        saveInFlightRef.current = false;
        setIsSaving(false);
        if (hasQueuedSaveRef.current) {
          hasQueuedSaveRef.current = false;
          if (serializeTemplate(useTemplateEditorStore.getState().template) !== lastSavedSnapshotRef.current) setSaveRetryKey((key) => key + 1);
        }
      }
    },
    [markClean, templateId],
  );

  useEffect(() => {
    if (initialTemplate) {
      if (hydratedTemplateIdRef.current === templateId) return;
      hydratedTemplateIdRef.current = templateId;
      lastSavedSnapshotRef.current = serializeTemplate(initialTemplate);
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
        const loadedTemplate = templateFromApiRow(payload.data as TemplateApiRow);
        lastSavedSnapshotRef.current = serializeTemplate(loadedTemplate);
        setTemplate(loadedTemplate);
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
    if (!autoSaveEnabled || !isDirty || status !== "ready") return;
    const timeoutId = window.setTimeout(() => void saveTemplate(useTemplateEditorStore.getState().template), 2_000);
    return () => window.clearTimeout(timeoutId);
  }, [autoSaveEnabled, isDirty, saveRetryKey, saveTemplate, status, template]);

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
        <PropertiesPanel block={selectedBlock} onOpenVariables={() => setVariablesOpen(true)} />
      </div>
      <VariablesDrawer open={variablesOpen} onOpenChange={setVariablesOpen} />
    </div>
  );
}

function serializeTemplate(template: Template): string {
  return JSON.stringify(template);
}
