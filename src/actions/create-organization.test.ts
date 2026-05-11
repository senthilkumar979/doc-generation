import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockRevalidatePath, mockCreateServerSupabase } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockCreateServerSupabase: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: mockCreateServerSupabase,
}));

import { createOrganizationAction } from "./create-organization";

function formWithName(name: string) {
  const fd = new FormData();
  fd.set("name", name);
  return fd;
}

function mockSupabaseChain(overrides: {
  user?: { id: string } | null;
  orgResult?: { data: { id: string } | null; error: { message: string } | null };
  memberError?: { message: string } | null;
}) {
  const user = overrides.user === undefined ? { id: "user-1" } : overrides.user;
  const orgResult = overrides.orgResult ?? {
    data: { id: "org-1" },
    error: null,
  };
  const memberError = overrides.memberError ?? null;

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn((table: string) => {
      if (table === "organizations") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(orgResult),
            }),
          }),
        };
      }
      if (table === "organization_members") {
        return {
          insert: vi.fn().mockResolvedValue({ error: memberError }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    }),
  };
}

describe("createOrganizationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error for short name", async () => {
    const result = await createOrganizationAction(undefined, formWithName("a"));
    expect(result.error).toMatch(/2–120/);
  });

  it("returns error when not signed in", async () => {
    mockCreateServerSupabase.mockResolvedValue(mockSupabaseChain({ user: null }));

    const result = await createOrganizationAction(undefined, formWithName("My Org"));

    expect(result.error).toBe("You must be signed in.");
  });

  it("returns organization insert error message", async () => {
    mockCreateServerSupabase.mockResolvedValue(
      mockSupabaseChain({
        orgResult: { data: null, error: { message: "duplicate key" } },
      }),
    );

    const result = await createOrganizationAction(undefined, formWithName("My Org"));

    expect(result.error).toBe("duplicate key");
  });

  it("returns member insert error message", async () => {
    mockCreateServerSupabase.mockResolvedValue(
      mockSupabaseChain({
        memberError: { message: "membership failed" },
      }),
    );

    const result = await createOrganizationAction(undefined, formWithName("My Org"));

    expect(result.error).toBe("membership failed");
  });

  it("revalidates and returns ok on success", async () => {
    mockCreateServerSupabase.mockResolvedValue(mockSupabaseChain({}));

    const result = await createOrganizationAction(undefined, formWithName("My Org"));

    expect(result).toEqual({ ok: true });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
