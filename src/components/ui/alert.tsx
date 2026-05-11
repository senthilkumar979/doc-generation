import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm shadow-[inset_0_1px_0_rgb(255_255_255_/_6%)] [&_svg]:absolute [&_svg]:left-4 [&_svg]:top-3.5 [&_svg]:size-4 [&_svg]:text-current [&:has(svg)]:pl-11",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/60 text-foreground",
        destructive: "border-destructive/45 bg-destructive/10 text-destructive",
        success: "border-brand-success/40 bg-brand-success/10 text-brand-success",
        warning: "border-brand-warning/45 bg-brand-warning/10 text-brand-warning",
        info: "border-brand-info/40 bg-brand-info/10 text-brand-info",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <h5 className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm opacity-95 [&_p]:leading-relaxed", className)} {...props} />;
}
