'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { DashboardBreadcrumbs } from '@/components/dashboard/dashboard-breadcrumbs'
import { LinkNavPending } from '@/components/dashboard/sidebar/link-nav-pending'
import { DashboardTopNav } from '@/components/dashboard/dashboard-top-nav'
import { settingsNavConfig } from '@/components/dashboard/sidebar/dashboard-nav'
import { SettingsSidebar } from '@/components/dashboard/sidebar/settings-sidebar'
import { cn } from '@/lib/utils'

export interface DashboardShellProps {
  profileName: string
  userEmail: string
  children: React.ReactNode
}

const settingsFlat = settingsNavConfig.flatMap((g) => g.items)

export function DashboardShell({
  profileName,
  userEmail,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const isSettingsSection = pathname.startsWith('/dashboard/settings')

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <DashboardTopNav profileName={profileName} userEmail={userEmail} />

      {isSettingsSection ? (
        <nav
          className="flex gap-1 overflow-x-auto border-b border-border bg-muted/30 px-2 py-2 md:hidden"
          aria-label="Settings sections"
        >
          {settingsFlat.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={cn(
                  'focus-ring relative shrink-0 rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap',
                  active
                    ? 'bg-card text-foreground ring-1 ring-border'
                    : 'text-muted-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
                <LinkNavPending />
              </Link>
            )
          })}
        </nav>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
        {isSettingsSection ? (
          <div className="hidden h-full min-h-0 md:flex">
            <SettingsSidebar />
          </div>
        ) : null}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background py-2 px-2">
          <div className="border-border shrink-0 rounded-md border bg-muted/20 px-4 py-3 w-fit ">
            <div className="mx-auto max-w-2xl">
              <DashboardBreadcrumbs />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
