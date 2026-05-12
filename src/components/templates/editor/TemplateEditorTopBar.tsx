"use client";

import { Eye, EyeOff, Redo2, Save, Undo2, Variable } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTemplateEditorStore } from "@/lib/templates/template-editor.store";

interface TemplateEditorTopBarProps {
  isSaving: boolean;
  onOpenVariables: () => void;
  onSave: () => void;
}

export function TemplateEditorTopBar({ isSaving, onOpenVariables, onSave }: TemplateEditorTopBarProps) {
  const template = useTemplateEditorStore((state) => state.template);
  const historyIndex = useTemplateEditorStore((state) => state.historyIndex);
  const historyLength = useTemplateEditorStore((state) => state.history.length);
  const isDirty = useTemplateEditorStore((state) => state.isDirty);
  const previewMode = useTemplateEditorStore((state) => state.previewMode);
  const redo = useTemplateEditorStore((state) => state.redo);
  const setPreviewMode = useTemplateEditorStore((state) => state.setPreviewMode);
  const undo = useTemplateEditorStore((state) => state.undo);
  const updateTemplateMeta = useTemplateEditorStore((state) => state.updateTemplateMeta);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Input
        aria-label="Template name"
        className="max-w-sm border-transparent bg-transparent text-base font-semibold shadow-none hover:border-border focus:border-input"
        value={template.name}
        onChange={(event) => updateTemplateMeta({ name: event.target.value })}
      />
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={historyIndex <= 0} onClick={undo}>
          <Undo2 />
          Undo
        </Button>
        <Button variant="outline" size="sm" disabled={historyIndex >= historyLength - 1} onClick={redo}>
          <Redo2 />
          Redo
        </Button>
        <Button variant={previewMode ? "secondary" : "outline"} size="sm" onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? <EyeOff /> : <Eye />}
          {previewMode ? "Editing" : "Preview"}
        </Button>
        <Button variant="outline" size="sm" onClick={onOpenVariables}>
          <Variable />
          Variables
        </Button>
        <Button size="sm" disabled={!isDirty || isSaving} onClick={onSave}>
          <Save />
          {isDirty ? (isSaving ? "Saving..." : "Save") : "Saved"}
        </Button>
      </div>
    </header>
  );
}
