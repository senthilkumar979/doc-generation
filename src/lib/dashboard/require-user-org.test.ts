import { beforeEach, describe, expect, it, vi } from "vitest";

const navMocks = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/supabase/env", () => ({
  getSupabasePublicEnv: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: [string]) => navMocks.redirectMock(...args),
}));

vi.mock("@/lib/orgs/first-org-id", () => ({
  fetchFirstOrgIdForUser: vi.fn(),
}));

import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";

import { requireUserWithOrg } from "./require-user-org";

describe("requireUserWithOrg", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validEnv = { url: "https://example.supabase.co", publicApiKey: "abcdefghijklmnopqrstuvwxyzabcd" };

  it("returns missing_env when Supabase env is absent", async () => {
    vi.mocked(getSupabasePublicEnv).mockReturnValueOnce(null);

    await expect(requireUserWithOrg()).resolves.toEqual({ ok: false, reason: "missing_env" });
  });

  it("redirects to login without a user", async () => {
    vi.mocked(getSupabasePublicEnv).mockReturnValueOnce(validEnv);
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never);

    await expect(requireUserWithOrg()).rejects.toThrow(/REDIRECT:\/login/);
    expect(navMocks.redirectMock).toHaveBeenCalledWith("/login");
  });

  it("redirects to onboarding without org membership", async () => {
    vi.mocked(getSupabasePublicEnv).mockReturnValueOnce(validEnv);
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce(null);

    await expect(requireUserWithOrg()).rejects.toThrow(/REDIRECT:\/onboarding\/organization/);
    expect(navMocks.redirectMock).toHaveBeenCalledWith("/onboarding/organization");
  });

  it("returns session when user has org", async () => {
    vi.mocked(getSupabasePublicEnv).mockReturnValueOnce(validEnv);
    const client = {};
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", email: "a@b.c" } } }),
      },
      ...client,
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-9");

    const result = await requireUserWithOrg();
    expect(result).toMatchObject({
      ok: true,
      session: { orgId: "org-9", user: { id: "u1", email: "a@b.c" } },
    });
  });
});
