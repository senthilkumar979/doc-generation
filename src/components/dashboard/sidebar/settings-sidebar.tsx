"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LinkNavPending } from "@/components/dashboard/sidebar/link-nav-pending";
import { cn } from "@/lib/utils";

import { settingsNavConfig } from "./dashboard-nav";

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-full w-[min(100vw-4rem,260px)] shrink-0 flex-col border-r border-border/90 bg-muted/25"
      aria-label="Settings"
    >
      <div className="flex h-12 shrink-0 items-center border-b border-border/80 px-4">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Settings</span>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
        {settingsNavConfig.map((group) => (
          <div key={group.title}>
            <p className="text-muted-foreground px-2 pb-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      className={cn(
                        "focus-ring relative block rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-card font-medium text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      {item.label}
                      <LinkNavPending />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
