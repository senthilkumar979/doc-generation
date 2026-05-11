import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide uppercase tabular-nums transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary/15 text-text-secondary",
        secondary: "border-border bg-muted text-text-secondary",
        outline: "border-border text-text-secondary",
        success: "border-brand-success/35 bg-brand-success/12 text-brand-success",
        warning: "border-brand-warning/40 bg-brand-warning/12 text-brand-warning",
        destructive: "border-destructive/35 bg-destructive/12 text-destructive",
        info: "border-brand-info/35 bg-brand-info/12 text-brand-info",
        accent: "border-accent/40 bg-accent/10 text-accent",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
