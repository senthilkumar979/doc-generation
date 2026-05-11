import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export type PageMainProps = HTMLAttributes<HTMLElement>

export function PageMain({ className, children, ...props }: PageMainProps) {
  return (
    <main
      data-slot="page-main"
      className={cn('mx-auto max-w-screen-lg px-2 py-14 sm:py-16', className)}
      {...props}
    >
      {children}
    </main>
  )
}
