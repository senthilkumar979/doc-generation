import { beforeEach, describe, expect, it, vi } from "vitest";

const navMocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: navMocks.revalidatePath,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

import { createServerSupabase } from "@/lib/supabase/server";

import { revokeApiKeyAction } from "./revoke-api-key";

describe("revokeApiKeyAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for invalid id", async () => {
    const fd = new FormData();
    fd.set("id", "not-a-uuid");
    const result = await revokeApiKeyAction(undefined, fd);
    expect(result.error).toMatch(/Invalid/);
  });

  it("returns error when anonymous", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never);
    const fd = new FormData();
    fd.set("id", "00000000-0000-4000-8000-000000000001");
    const result = await revokeApiKeyAction(undefined, fd);
    expect(result.error).toMatch(/signed in/i);
  });

  it("reports already revoked rows", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
      })),
    } as never);

    const fd = new FormData();
    fd.set("id", "123e4567-e89b-12d3-a456-426614174000");
    const result = await revokeApiKeyAction(undefined, fd);
    expect(result.error).toMatch(/already revoked/i);
  });

  it("returns ok after revoke", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "123e4567-e89b-12d3-a456-426614174000" },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      })),
    } as never);

    const fd = new FormData();
    fd.set("id", "123e4567-e89b-12d3-a456-426614174000");
    const result = await revokeApiKeyAction(undefined, fd);
    expect(result.ok).toBe(true);
    expect(navMocks.revalidatePath).toHaveBeenCalledWith("/dashboard/api-keys");
  });
});
