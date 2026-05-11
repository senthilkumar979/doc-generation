"use client";

import { TemplateComposer } from "./TemplateComposer";
import { TemplateRows } from "./TemplateRows";
import type { TemplateRowDto } from "./template-row-dto";

export interface TemplatesPanelProps {
  templates: TemplateRowDto[];
}

export function TemplatesPanel({ templates }: TemplatesPanelProps) {
  return (
    <div className="space-y-10">
      <TemplateComposer />
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Your templates</h2>
        <div className="mt-4">
          <TemplateRows templates={templates} />
        </div>
      </section>
    </div>
  );
}
