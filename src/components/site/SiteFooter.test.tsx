/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./AuthLinks", () => ({
  AuthLinks: () => <span data-testid="auth-links">auth</span>,
}));

import { SiteFooter } from "./SiteFooter";

describe("SiteFooter", () => {
  it("links to public releases", () => {
    render(<SiteFooter />);
    const link = screen.getByRole("link", { name: /release notes/i });
    expect(link).toHaveAttribute("href", "/releases");
  });
});
