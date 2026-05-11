import { describe, expect, it } from "vitest";

import { getDashboardBreadcrumbItems } from "@/lib/dashboard/breadcrumb-trail";

describe("getDashboardBreadcrumbItems", () => {
  it("returns a single crumb on the dashboard home", () => {
    expect(getDashboardBreadcrumbItems("/dashboard")).toEqual([{ label: "Dashboard" }]);
  });

  it("links dashboard and titles top-level sections", () => {
    expect(getDashboardBreadcrumbItems("/dashboard/templates")).toEqual([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Templates" },
    ]);
  });

  it("uses settings labels for nested settings routes", () => {
    expect(getDashboardBreadcrumbItems("/dashboard/settings/general")).toEqual([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/dashboard/settings" },
      { label: "General" },
    ]);
  });

  it("normalizes trailing slashes", () => {
    expect(getDashboardBreadcrumbItems("/dashboard/files/")).toEqual([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Files" },
    ]);
  });
});
