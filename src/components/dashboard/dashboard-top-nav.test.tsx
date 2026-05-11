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

vi.mock("@/components/dashboard/sidebar/link-nav-pending", () => ({
  LinkNavPending: () => null,
}));

import { DashboardTopNav } from "./dashboard-top-nav";

describe("DashboardTopNav", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders brand home link and main nav items", () => {
    mockPathname.mockReturnValue("/dashboard/templates");
    render(<DashboardTopNav profileName="Sam River" userEmail="sam@example.com" />);

    expect(screen.getByTitle("DocRail home")).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Templates/i })).toHaveAttribute(
      "href",
      "/dashboard/templates",
    );
    expect(screen.getByRole("button", { name: "Account menu" })).toBeInTheDocument();
  });
});
