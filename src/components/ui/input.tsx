import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    data-slot="input"
    className={cn(
      "focus-ring flex h-10 w-full min-w-0 rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-[inset_0_1px_2px_rgb(15_23_42_/_45%)] transition-[border-color,box-shadow] placeholder:text-muted-foreground selection:bg-accent/35 disabled:cursor-not-allowed disabled:opacity-55",
      "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:text-foreground file:font-medium",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
