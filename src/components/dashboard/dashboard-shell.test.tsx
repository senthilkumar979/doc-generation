/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockPathname = vi.hoisted(() => vi.fn(() => "/dashboard"));

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

vi.mock("@/components/dashboard/sidebar/link-nav-pending", () => ({
  LinkNavPending: () => null,
}));

import { DashboardShell } from "./dashboard-shell";

describe("DashboardShell", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows breadcrumbs and page content outside settings", () => {
    mockPathname.mockReturnValue("/dashboard/templates");
    render(
      <DashboardShell profileName="Sam" userEmail="sam@example.com">
        <main>Child</main>
      </DashboardShell>,
    );

    expect(screen.getByText("DocRail")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.queryByRole("aside", { name: "Settings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Settings sections" })).not.toBeInTheDocument();
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("renders settings chrome when under /dashboard/settings", () => {
    mockPathname.mockReturnValue("/dashboard/settings/general");
    render(
      <DashboardShell profileName="Sam" userEmail="sam@example.com">
        <main>Setup</main>
      </DashboardShell>,
    );

    expect(screen.getByRole("complementary", { name: "Settings" })).toBeInTheDocument();
    const mobile = screen.getByRole("navigation", { name: "Settings sections" });
    expect(within(mobile).getByRole("link", { name: "General" })).toHaveAttribute(
      "href",
      "/dashboard/settings/general",
    );
    expect(screen.getByText("Setup")).toBeInTheDocument();
  });
});
