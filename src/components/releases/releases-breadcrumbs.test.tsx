/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { ReleaseDetailBreadcrumbs, ReleasesIndexBreadcrumbs } from "./releases-breadcrumbs";

describe("releases breadcrumbs", () => {
  afterEach(() => cleanup());

  it("renders index crumbs", () => {
    render(<ReleasesIndexBreadcrumbs />);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Release notes")).toHaveAttribute("aria-current", "page");
  });

  it("renders detail crumbs with truncated page title container", () => {
    render(<ReleaseDetailBreadcrumbs title="Version 99 — deep dive" />);

    expect(screen.getByRole("link", { name: "Release notes" })).toHaveAttribute("href", "/releases");
    const pageCrumb = screen.getByText("Version 99 — deep dive");
    expect(pageCrumb).toHaveAttribute("aria-current", "page");
    expect(pageCrumb.className).toMatch(/line-clamp/);
  });
});
