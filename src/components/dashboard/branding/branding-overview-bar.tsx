/* eslint-disable @next/next/no-img-element */
"use client";

import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

import { Text } from "@/components/ui/text";

interface BrandingOverviewBarProps {
  /** Display name for preview strip */
  headline: string;
  subtitle: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  logoUrl: string;
  iconUrl: string;
  icon: LucideIcon;
}

export function BrandingOverviewBar({
  headline,
  subtitle,
  primaryColor,
  secondaryColor,
  accentColor,
  logoUrl,
  iconUrl,
  icon: IconMark,
}: BrandingOverviewBarProps) {
  const swatches = [
    { label: "Primary", hex: primaryColor },
    { label: "Secondary", hex: secondaryColor },
    { label: "Accent", hex: accentColor },
  ];

  const hasLogo = logoUrl.trim().length > 0;
  const hasIcon = iconUrl.trim().length > 0;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.06] via-card to-muted/40 shadow-[0_36px_90px_-48px_rgb(37_99_235_/_35%),inset_0_1px_0_rgb(255_255_255_/_12%)] backdrop-blur-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
      aria-label="Brand overview"
    >
      <div className="pointer-events-none absolute -right-16 -top-24 size-[min(380px,90vw)] rounded-full bg-primary/[0.085] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-1/4 size-[min(280px,70vw)] rounded-full bg-accent/[0.055] blur-3xl" aria-hidden />

      <div className="relative grid gap-8 p-8 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="size-3 opacity-90" aria-hidden />
            Brand system
          </div>
          <div>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.12] text-primary ring-1 ring-primary/[0.2]">
                <IconMark className="size-6" aria-hidden />
              </span>
              <div className="min-w-0 space-y-2">
                <Text className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">{headline}</Text>
                {subtitle ? (
                  <Text muted className="max-w-lg text-sm leading-relaxed sm:text-[0.9375rem]">
                    {subtitle}
                  </Text>
                ) : (
                  <Text muted className="text-sm leading-relaxed italic">
                    Add a tagline so it appears on templates and exports.
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 sm:min-w-[17rem]">
          <div className="flex justify-between gap-6 sm:flex-col sm:gap-4">
            <Text className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Palette</Text>
            <div className="flex items-end gap-4">
              {swatches.map(({ label, hex }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <span
                    className="size-[2.875rem] rounded-2xl border border-border/80 shadow-[inset_0_2px_6px_rgb(255_255_255_/_12%),0_14px_30px_-12px_rgb(15_23_42_/_40%)] ring-2 ring-background"
                    style={{ backgroundColor: hex?.trim() ? hex : "var(--muted)" }}
                    aria-label={hex?.trim() ? `${label}: ${hex}` : `${label} not set`}
                  />
                  <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/90 p-4 shadow-inner ring-1 ring-black/[0.03] dark:bg-card/70 dark:ring-white/[0.05]">
            <Text className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Core media</Text>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-lg border border-dashed border-border/90 bg-muted/40">
                {hasLogo ? (
                  <img src={logoUrl} alt="Logo thumbnail" className="max-h-14 max-w-14 rounded object-contain" />
                ) : (
                  <span className="text-[0.65rem] text-muted-foreground">Logo</span>
                )}
              </div>
              <div className="flex size-14 items-center justify-center rounded-lg border border-dashed border-border/90 bg-muted/40">
                {hasIcon ? (
                  <img src={iconUrl} alt="Icon thumbnail" className="max-h-12 max-w-12 rounded object-contain" />
                ) : (
                  <span className="text-[0.65rem] text-muted-foreground">Icon</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
