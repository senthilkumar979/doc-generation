"use client";

import * as React from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type DrawerSide = "top" | "right" | "bottom" | "left";

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  overlayClassName?: string;
  showClose?: boolean;
  side?: DrawerSide;
}

const sideClasses: Record<DrawerSide, string> = {
  top: "inset-x-0 top-0 max-h-[85vh] border-b data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
  right:
    "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 sm:max-w-md",
  bottom:
    "inset-x-0 bottom-0 max-h-[85vh] border-t data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
  left:
    "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 sm:max-w-md",
};

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerPortal = DialogPrimitive.Portal;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
      className,
    )}
    {...props}
  />
));
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, children, overlayClassName, showClose = true, side = "right", ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay className={overlayClassName} />
    <DialogPrimitive.Content
      ref={ref}
      data-slot="drawer-content"
      className={cn(
        "fixed z-50 flex flex-col gap-4 border-border bg-card p-6 text-foreground shadow-[0_24px_80px_-24px_rgb(15_23_42_/_90%)] transition-transform duration-200 ease-out data-[state=closed]:pointer-events-none",
        sideClasses[side],
        className,
      )}
      {...props}
    >
      {children}
      {showClose ? (
        <DialogPrimitive.Close
          type="button"
          className="focus-ring absolute top-4 right-4 rounded-md p-1 text-muted-foreground opacity-80 transition-opacity hover:text-foreground hover:opacity-100 disabled:pointer-events-none"
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = DialogPrimitive.Content.displayName;

export function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="drawer-header" className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="drawer-footer" className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export function DrawerTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function DrawerDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
