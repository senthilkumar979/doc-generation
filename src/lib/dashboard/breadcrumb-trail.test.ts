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

  it("treats bare path as dashboard home", () => {
    expect(getDashboardBreadcrumbItems("")).toEqual([{ label: "Dashboard" }]);
  });

  it("titles the settings root without a trailing link", () => {
    expect(getDashboardBreadcrumbItems("/dashboard/settings")).toEqual([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings" },
    ]);
  });

  it("title-cases unknown settings leaf segments when not in nav map", () => {
    expect(getDashboardBreadcrumbItems("/dashboard/settings/custom-page")).toEqual([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/dashboard/settings" },
      { label: "Custom Page" },
    ]);
  });

  it("title-cases unknown non-settings segments", () => {
    expect(getDashboardBreadcrumbItems("/dashboard/weird-route-name")).toEqual([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Weird Route Name" },
    ]);
  });
});

