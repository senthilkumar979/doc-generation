/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockUseLinkStatus = vi.hoisted(() => vi.fn(() => ({ pending: false as boolean })));

vi.mock("next/link", () => ({
  useLinkStatus: () => mockUseLinkStatus(),
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

import { LinkNavPending } from "./link-nav-pending";

describe("LinkNavPending", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders nothing when not pending", () => {
    mockUseLinkStatus.mockReturnValue({ pending: false });
    const { container } = render(
      <a href="/x">
        <LinkNavPending />
      </a>,
    );
    expect(container.querySelector("span[aria-hidden]")).toBeNull();
  });

  it("renders a visual ring when pending", () => {
    mockUseLinkStatus.mockReturnValue({ pending: true });
    const { container } = render(
      <a href="/x">
        <LinkNavPending />
      </a>,
    );
    expect(container.querySelector("span[aria-hidden]")).toBeTruthy();
  });
});
