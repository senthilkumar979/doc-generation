import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  muted?: boolean;
}

export function Text({ className, muted, ...props }: TextProps) {
  return (
    <p
      data-slot="text"
      className={cn("text-sm leading-relaxed text-foreground", muted && "text-muted-foreground", className)}
      {...props}
    />
  );
}
