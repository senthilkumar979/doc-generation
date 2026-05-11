/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

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

import { HeaderProfileMenu } from "./header-profile-menu";

describe("HeaderProfileMenu", () => {
  afterEach(() => cleanup());

  it("shows two-letter initials for multi-word names", () => {
    render(<HeaderProfileMenu profileName="Sam River" userEmail="sam@example.com" />);
    expect(screen.getByText("SR")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account menu" })).toBeInTheDocument();
  });

  it("surfaces primary profile actions", async () => {
    const user = userEvent.setup();
    render(<HeaderProfileMenu profileName="Ada" userEmail="ada@example.com" />);

    await user.click(screen.getByRole("button", { name: "Account menu" }));

    expect(await screen.findByRole("menuitem", { name: /^profile$/i })).toHaveAttribute(
      "href",
      "/dashboard/profile",
    );
    expect(screen.getByRole("menuitem", { name: /change password/i })).toHaveAttribute(
      "href",
      "/dashboard/password",
    );
    expect(screen.getByRole("menuitem", { name: /sign out/i })).toHaveAttribute(
      "form",
      "header-signout-form",
    );
  });
});
