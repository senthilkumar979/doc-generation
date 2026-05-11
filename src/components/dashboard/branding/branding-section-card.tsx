import { Building2, Image as ImageIcon, Images, LayoutTemplate, Palette, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { BrandingSectionCardValue } from "./branding-section-card-value";

const TITLE_ICONS: Partial<Record<string, LucideIcon>> = {
  Identity: Building2,
  "Brand colors": Palette,
  "Core media": ImageIcon,
  "Additional images": Images,
};

interface BrandingSectionCardProps {
  title: string;
  description: string;
  rows: Array<{ label: string; value: string | null; onRemove?: () => void | Promise<void> }>;
  emptyText?: string;
  onEdit: () => void;
}

export function BrandingSectionCard({
  title,
  description,
  rows,
  emptyText = "No data available",
  onEdit,
}: BrandingSectionCardProps) {
  const populated = rows.filter((r) => !!r.value?.trim()).length;
  const SectionIcon = TITLE_ICONS[title] ?? LayoutTemplate;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border-border/70 bg-card/80 shadow-[0_28px_70px_-42px_rgb(37_99_235_/_38%),inset_0_1px_0_rgb(255_255_255_/_14%)] backdrop-blur-[2px] ring-1 ring-black/[0.035] transition-[box-shadow] duration-300 hover:shadow-[0_34px_88px_-42px_rgb(37_99_235_/_42%),inset_0_1px_0_rgb(255_255_255_/_14%)] dark:bg-card/65 dark:ring-white/[0.05]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/[0.35] to-transparent opacity-80"
        aria-hidden
      />
      <CardHeader className="flex-row flex-wrap items-start gap-4 border-b border-border/60 pb-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/[0.22] to-primary/[0.06] text-primary shadow-inner ring-1 ring-primary/[0.14]">
          <SectionIcon className="size-[1.35rem]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="text-[1.0625rem] font-semibold tracking-tight text-foreground">{title}</CardTitle>
            <Badge variant={populated > 0 ? "success" : "secondary"} className="normal-case tabular-nums tracking-normal">
              {populated > 0 ? "Configured" : "Incomplete"}
            </Badge>
          </div>
          <CardDescription className="text-[0.8125rem] leading-relaxed text-muted-foreground">{description}</CardDescription>
        </div>
        <Button variant="default" size="sm" className="ml-auto shrink-0 rounded-lg font-medium shadow-sm" onClick={onEdit}>
          {populated > 0 ? "Edit" : "Add"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-0 pt-6">
        {rows.map((row, i) => (
          <div key={row.label}>
            {i > 0 ? <Separator className="my-4 bg-border/60" /> : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:items-start">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{row.label}</span>
              <div className="text-sm leading-relaxed">
                <BrandingSectionCardValue label={row.label} value={row.value} onRemove={row.onRemove} />
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/[0.35] px-5 py-10 text-center">
            <p className="text-sm italic leading-relaxed text-muted-foreground">{emptyText}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
