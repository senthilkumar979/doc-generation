/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockPathname = "/dashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => ({ toString: () => "" }),
}));

describe("route progress wiring", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mockPathname = "/dashboard";
  });

  it("does not blow up when consulted outside RouteProgressProvider", async () => {
    const mod = await import("./route-progress-provider");
    const { result } = renderHook(() => mod.useRouteTransition());
    expect(() => result.current.beginNavigation()).not.toThrow();
  });

  it("renders children from RouteProgressProvider", async () => {
    const mod = await import("./route-progress-provider");
    render(
      <mod.RouteProgressProvider>
        <div>Inside</div>
      </mod.RouteProgressProvider>,
    );
    expect(screen.getByText("Inside")).toBeInTheDocument();
  });

  it("shows a progress bar when beginNavigation runs and clears after the stuck timeout", async () => {
    vi.useFakeTimers();

    const mod = await import("./route-progress-provider");

    function Trigger() {
      const { beginNavigation } = mod.useRouteTransition();
      return (
        <button type="button" onClick={beginNavigation}>
          start
        </button>
      );
    }

    try {
      render(
        <mod.RouteProgressProvider>
          <Trigger />
        </mod.RouteProgressProvider>,
      );

      fireEvent.click(screen.getByRole("button", { name: "start" }));
      expect(screen.getByRole("progressbar", { name: "Loading page" })).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(12_000);
      });

      expect(screen.queryByRole("progressbar", { name: "Loading page" })).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("hides the bar when the pathname changes", async () => {
    vi.useFakeTimers();

    const mod = await import("./route-progress-provider");

    function Trigger() {
      const { beginNavigation } = mod.useRouteTransition();
      return (
        <button type="button" onClick={beginNavigation}>
          start
        </button>
      );
    }

    try {
      const { rerender } = render(
        <mod.RouteProgressProvider>
          <Trigger />
        </mod.RouteProgressProvider>,
      );

      fireEvent.click(screen.getByRole("button", { name: "start" }));
      expect(screen.getByRole("progressbar", { name: "Loading page" })).toBeInTheDocument();

      mockPathname = "/dashboard/settings";
      rerender(
        <mod.RouteProgressProvider>
          <Trigger />
        </mod.RouteProgressProvider>,
      );

      expect(screen.queryByRole("progressbar", { name: "Loading page" })).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("starts navigation on capturing click for an internal route change anchor", async () => {
    vi.stubGlobal(
      "location",
      {
        href: "https://example.org/dashboard",
        origin: "https://example.org",
        pathname: "/dashboard",
        search: "",
      } as Location,
    );

    const mod = await import("./route-progress-provider");
    render(
      <mod.RouteProgressProvider>
        {/* prevent jsdom from attempting real navigation after the capture-phase handler runs */}
        <a
          href="/templates"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          Templates
        </a>
      </mod.RouteProgressProvider>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Templates" }));
    expect(screen.getByRole("progressbar", { name: "Loading page" })).toBeInTheDocument();
  });
});
