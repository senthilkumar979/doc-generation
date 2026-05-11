import { mainNavItems, settingsNavConfig } from "@/components/dashboard/sidebar/dashboard-nav";

export interface DashboardBreadcrumbCrumb {
  label: string;
  /** When missing, this crumb is the current page. */
  href?: string;
}

function buildDashboardPathLabels(): Record<string, string> {
  const map: Record<string, string> = {};

  for (const group of settingsNavConfig) {
    for (const item of group.items) {
      map[item.href] = item.label;
    }
  }

  for (const item of mainNavItems) {
    if (!item.href.startsWith("/dashboard/settings")) map[item.href] = item.label;
  }

  Object.assign(map, {
    "/dashboard": "Dashboard",
    "/dashboard/profile": "Profile",
    "/dashboard/password": "Change password",
    "/dashboard/api-keys": "API keys",
  });

  return map;
}

const DASHBOARD_PATH_LABELS = buildDashboardPathLabels();

function titleCaseSegment(segment: string): string {
  const s = segment.replace(/-/g, " ");
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/dashboard";
}

/**
 * Dashboard-only breadcrumb trail. First segment is always the app dashboard (not the marketing home page).
 */
export function getDashboardBreadcrumbItems(pathname: string): DashboardBreadcrumbCrumb[] {
  const path = normalizePath(pathname);

  if (path === "/dashboard") {
    return [{ label: "Dashboard" }];
  }

  const root: DashboardBreadcrumbCrumb = { label: "Dashboard", href: "/dashboard" };

  if (path.startsWith("/dashboard/settings")) {
    const settingsMid: DashboardBreadcrumbCrumb = { label: "Settings", href: "/dashboard/settings" };
    if (path === "/dashboard/settings") {
      return [root, { label: "Settings" }];
    }

    const label = DASHBOARD_PATH_LABELS[path] ?? titleCaseSegment(path.split("/").pop() ?? "Page");
    return [root, settingsMid, { label }];
  }

  const label = DASHBOARD_PATH_LABELS[path] ?? titleCaseSegment(path.replace(/^\/dashboard\/?/, ""));
  return [root, { label }];
}
