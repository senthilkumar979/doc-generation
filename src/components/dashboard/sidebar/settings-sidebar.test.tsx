/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockPathname = vi.hoisted(() => vi.fn(() => "/dashboard/settings/general"));

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

import { SettingsSidebar } from "./settings-sidebar";

describe("SettingsSidebar", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("lists grouped settings links and marks the active item", () => {
    mockPathname.mockReturnValue("/dashboard/settings/general");
    render(<SettingsSidebar />);

    const aside = screen.getByRole("complementary", { name: "Settings" });
    expect(within(aside).getByText("Configuration")).toBeInTheDocument();
    const general = within(aside).getByRole("link", { name: "General" });
    expect(general).toHaveAttribute("href", "/dashboard/settings/general");
    expect(general.className).toMatch(/bg-card/);
  });

  it("treats nested paths as active for the matching settings item", () => {
    mockPathname.mockReturnValue("/dashboard/settings/api-keys/extra-segment");
    render(<SettingsSidebar />);

    const apiKeys = screen.getByRole("link", { name: "API keys" });
    expect(apiKeys.className).toMatch(/bg-card/);
  });
});
