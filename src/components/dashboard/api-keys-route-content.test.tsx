/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { UserOrgSession } from "@/lib/dashboard/require-user-org";

vi.mock("@/lib/supabase/env", () => ({
  getSupabasePublicEnv: vi.fn(),
}));

vi.mock("@/lib/dashboard/require-user-org", () => ({
  requireUserWithOrg: vi.fn(),
}));

vi.mock("@/components/dashboard/ApiKeysPanel", () => ({
  ApiKeysPanel: ({ keys }: { keys: { id: string }[] }) => (
    <div data-testid="api-keys-panel">{keys.map((k) => k.id).join(",")}</div>
  ),
}));

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";

import { ApiKeysRouteContent } from "./api-keys-route-content";

function mockSupabaseQuery(result: { data: unknown; error: unknown }) {
  const order = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ order });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { from } as unknown as UserOrgSession["supabase"];
}

describe("ApiKeysRouteContent", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSupabasePublicEnv).mockReturnValue({
      url: "https://x.supabase.co",
      publicApiKey: "k".repeat(20),
    });
  });

  it("explains setup when Supabase public env is missing", async () => {
    vi.mocked(getSupabasePublicEnv).mockReturnValue(null);
    const ui = await ApiKeysRouteContent();
    render(ui);
    expect(screen.getByRole("heading", { name: /^API keys$/i })).toBeInTheDocument();
    expect(screen.getByText(/README/i)).toBeInTheDocument();
  });

  it("shows a guarded message when the org gate rejects", async () => {
    vi.mocked(requireUserWithOrg).mockResolvedValue({ ok: false, reason: "missing_env" });
    const ui = await ApiKeysRouteContent();
    render(ui);
    expect(screen.getByText(/reload after applying env vars/i)).toBeInTheDocument();
  });

  it("surfaces Supabase errors from the api_keys query", async () => {
    vi.mocked(requireUserWithOrg).mockResolvedValue({
      ok: true,
      session: {
        orgId: "org-1",
        user: { id: "u1" } as UserOrgSession["user"],
        supabase: mockSupabaseQuery({ data: null, error: { message: "nope" } }),
      },
    });

    const ui = await ApiKeysRouteContent();
    render(ui);
    expect(screen.getByText(/could not load keys/i)).toBeInTheDocument();
    expect(screen.getByText("20250511153000_api_keys.sql")).toBeInTheDocument();
  });

  it("renders the panel when rows load cleanly", async () => {
    vi.mocked(requireUserWithOrg).mockResolvedValue({
      ok: true,
      session: {
        orgId: "org-1",
        user: { id: "u1" } as UserOrgSession["user"],
        supabase: mockSupabaseQuery({
          data: [{ id: "k1", name: "Dev", key_prefix: "pq12", created_at: "t", revoked_at: null }],
          error: null,
        }),
      },
    });

    const ui = await ApiKeysRouteContent();
    render(ui);
    expect(screen.getByText(/secrets are hashed/i)).toBeInTheDocument();
    expect(screen.getByTestId("api-keys-panel")).toHaveTextContent("k1");
  });
});
