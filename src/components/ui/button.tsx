import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_1px_-0.25px_rgb(15_23_42_/_55%)] hover:bg-brand-primary-dark",
        destructive: "bg-destructive text-destructive-foreground hover:bg-brand-error/90",
        outline:
          "border border-border bg-transparent text-text-secondary shadow-inner shadow-black/5 hover:bg-muted hover:text-text-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-brand-secondary/90",
        ghost: "hover:bg-muted/70 hover:text-foreground",
        link: "text-brand-accent underline-offset-4 hover:underline",
        success: "bg-brand-success text-primary-foreground hover:bg-brand-success/90",
        warning: "bg-brand-warning text-primary-foreground hover:bg-brand-warning/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-8 rounded-md px-3 text-xs",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        {...(asChild ? {} : { type })}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
