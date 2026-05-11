import Link from "next/link";

import { cn } from "@/lib/utils";

export interface TextLinkProps extends React.ComponentProps<typeof Link> {
  variant?: "accent" | "muted" | "foreground";
}

export function TextLink({ className, variant = "accent", ...props }: TextLinkProps) {
  return (
    <Link
      data-slot="text-link"
      className={cn(
        "focus-ring underline-offset-4 transition-colors hover:underline rounded-sm text-sm",
        variant === "accent" && "font-medium text-accent hover:text-accent/90",
        variant === "muted" && "text-muted-foreground font-normal hover:text-text-secondary",
        variant === "foreground" && "font-medium text-foreground hover:text-brand-primary",
        className,
      )}
      {...props}
    />
  );
}
