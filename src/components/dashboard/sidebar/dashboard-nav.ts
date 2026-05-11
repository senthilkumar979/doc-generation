import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FileText,
  FolderOpen,
  LayoutDashboard,
  ScrollText,
  Settings,
} from "lucide-react";

export interface MainNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const mainNavItems: MainNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/templates", label: "Templates", icon: FileText },
  { href: "/dashboard/settings/general", label: "Settings", icon: Settings },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/files", label: "Files", icon: FolderOpen },
  { href: "/dashboard/logs", label: "Logs", icon: ScrollText },
];

export interface SettingsNavGroup {
  title: string;
  items: { href: string; label: string }[];
}

export function isMainNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href.startsWith("/dashboard/settings")) return pathname.startsWith("/dashboard/settings");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const settingsNavConfig: SettingsNavGroup[] = [
  {
    title: "Configuration",
    items: [
      { href: "/dashboard/settings/general", label: "General" },
      { href: "/dashboard/settings/api-keys", label: "API keys" },
      { href: "/dashboard/settings/integrations", label: "Integrations" },
      { href: "/dashboard/settings/users", label: "Users" },
    ],
  },
  {
    title: "Billing",
    items: [
      { href: "/dashboard/settings/billing", label: "Subscription" },
      { href: "/dashboard/settings/usage", label: "Usage" }
    ],
  },
];
