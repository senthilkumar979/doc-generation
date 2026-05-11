"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

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
      <Separator />
      <section className="space-y-5">
        <Heading as="h2">Your templates</Heading>
        <TemplateRows templates={templates} />
      </section>
    </div>
  );
}
