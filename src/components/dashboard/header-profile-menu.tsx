'use client'

import { ChevronDown, KeyRound, LogOut, UserRound } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface HeaderProfileMenuProps {
  profileName: string
  userEmail: string
}

function initials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0]![0] + parts[1]![0]).toUpperCase()
  return label.slice(0, 2).toUpperCase() || '?'
}

export function HeaderProfileMenu({
  profileName,
  userEmail,
}: HeaderProfileMenuProps) {
  const initial = initials(profileName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          type="button"
          className={cn(
            'h-9 shrink-0 gap-2 border-border px-2 font-medium text-foreground hover:bg-muted/80',
          )}
          aria-label="Account menu"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
            {initial}
          </span>
          <span className="hidden max-w-[10rem] truncate sm:inline">
            {profileName}
          </span>
          <ChevronDown
            className="text-muted-foreground size-4 shrink-0 opacity-70"
            aria-hidden
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" collisionPadding={12}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {profileName}
            </span>
            <span className="text-muted-foreground text-xs font-normal">
              {userEmail}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            className="flex cursor-pointer items-center gap-2"
            href="/dashboard/profile"
          >
            <UserRound className="size-4 opacity-80" aria-hidden />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            className="flex cursor-pointer items-center gap-2"
            href="/dashboard/password"
          >
            <KeyRound className="size-4 opacity-80" aria-hidden />
            Change password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form
          id="header-signout-form"
          action="/auth/signout"
          method="post"
          className="hidden"
        />
        <DropdownMenuItem asChild>
          <button
            type="submit"
            form="header-signout-form"
            className="focus-ring flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-foreground"
          >
            <LogOut className="size-4 opacity-80" aria-hidden />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
