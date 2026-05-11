import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InlineCodeProps = HTMLAttributes<HTMLElement>;

export function InlineCode({ className, ...props }: InlineCodeProps) {
  return (
    <code
      data-slot="inline-code"
      className={cn(
        "rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem] text-text-secondary [font-feature-settings:inherit]",
        className,
      )}
      {...props}
    />
  );
}
