'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { HeaderProfileMenu } from '@/components/dashboard/header-profile-menu'
import { LinkNavPending } from '@/components/dashboard/sidebar/link-nav-pending'
import {
  isMainNavActive,
  mainNavItems,
} from '@/components/dashboard/sidebar/dashboard-nav'
import { cn } from '@/lib/utils'

export interface DashboardTopNavProps {
  profileName: string
  userEmail: string
}

export function DashboardTopNav({
  profileName,
  userEmail,
}: DashboardTopNavProps) {
  const pathname = usePathname()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/95 px-2 backdrop-blur-sm sm:gap-4 sm:px-4">
      <Link
        href="/dashboard"
        prefetch
        className="relative flex shrink-0 items-center gap-2 rounded-lg py-1.5 pr-2 font-semibold text-foreground sm:pr-3"
        title="DocRail home"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">
          D
        </span>
        <span className="hidden text-sm sm:inline">DocRail</span>
        <LinkNavPending />
      </Link>

      <nav
        className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto py-1 sm:gap-1"
        aria-label="Main navigation"
      >
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const active = isMainNavActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              title={item.label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'focus-ring relative flex shrink-0 items-center gap-2 rounded-t-lg px-2 py-2 text-sm font-medium transition-colors sm:px-3',
                active
                  ? 'bg-muted text-foreground shadow-[inset_0_-2px_0_0] shadow-accent'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
              <span className="hidden sm:inline">{item.label}</span>
              <LinkNavPending />
            </Link>
          )
        })}
      </nav>

      <HeaderProfileMenu profileName={profileName} userEmail={userEmail} />
    </header>
  )
}
