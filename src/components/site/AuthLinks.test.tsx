/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const linksMocks = vi.hoisted(() => ({
  getSupabasePublicEnv: vi.fn(),
  createServerSupabase: vi.fn(),
}));

vi.mock("@/lib/supabase/env", () => ({
  getSupabasePublicEnv: linksMocks.getSupabasePublicEnv,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: linksMocks.createServerSupabase,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { AuthLinks } from "./AuthLinks";

describe("AuthLinks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows helper text when Supabase env is missing", async () => {
    linksMocks.getSupabasePublicEnv.mockReturnValue(null);

    render(await AuthLinks());

    expect(screen.getByText(/Auth not configured/i)).toBeInTheDocument();
  });

  it("shows sign up and sign in without a session", async () => {
    linksMocks.getSupabasePublicEnv.mockReturnValue({
      url: "https://project.supabase.co",
      publicApiKey: "k".repeat(20),
    });
    linksMocks.createServerSupabase.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    render(await AuthLinks());

    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: /^sign in$/i })).toHaveAttribute("href", "/login");
  });

  it("shows sign out when authenticated", async () => {
    linksMocks.getSupabasePublicEnv.mockReturnValue({
      url: "https://project.supabase.co",
      publicApiKey: "k".repeat(20),
    });
    linksMocks.createServerSupabase.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
    });

    render(await AuthLinks());

    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sign up/i })).not.toBeInTheDocument();
  });
});
