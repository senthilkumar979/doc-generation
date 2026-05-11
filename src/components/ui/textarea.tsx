import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      rows={rows}
      className={cn(
        "focus-ring flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-[inset_0_1px_2px_rgb(15_23_42_/_45%)] transition-[border-color] placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
