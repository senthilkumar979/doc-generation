'use client'

import * as React from 'react'

import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/utils'

export type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root>

export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(
      'select-none text-sm font-medium text-text-secondary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-65 mb-4',
      className,
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName
