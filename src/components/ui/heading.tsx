import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const styles = {
  h1: "text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]",
  h2: "text-lg font-semibold tracking-tight text-foreground",
  h3: "text-base font-semibold tracking-tight text-foreground",
} as const;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: keyof typeof styles;
}

export function Heading({ as = "h1", className, ...props }: HeadingProps) {
  const Comp = as;
  return <Comp data-slot="heading" className={cn(styles[as], className)} {...props} />;
}
