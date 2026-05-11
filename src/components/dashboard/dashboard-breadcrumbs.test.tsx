/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockPathname = vi.hoisted(() => vi.fn(() => "/dashboard/templates"));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    prefetch,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    prefetch?: boolean;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    void prefetch;
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

import { DashboardBreadcrumbs } from "./dashboard-breadcrumbs";

describe("DashboardBreadcrumbs", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders links for parent crumbs and current page for the leaf", () => {
    mockPathname.mockReturnValue("/dashboard/templates");
    render(<DashboardBreadcrumbs />);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Templates")).toHaveAttribute("aria-current", "page");
  });

  it("falls back to /dashboard when pathname is nullish", () => {
    mockPathname.mockReturnValue(undefined as unknown as string);
    render(<DashboardBreadcrumbs />);
    expect(screen.getByText("Dashboard")).toHaveAttribute("aria-current", "page");
  });
});
