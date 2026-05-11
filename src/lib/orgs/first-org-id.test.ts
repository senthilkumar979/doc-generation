import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { fetchFirstOrgIdForUser } from "./first-org-id";

function asClient(mock: Record<string, unknown>): SupabaseClient {
  return mock as unknown as SupabaseClient;
}

describe("fetchFirstOrgIdForUser", () => {
  it("returns org_id from maybeSingle row", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { org_id: "org-a" }, error: null });
    const limit = vi.fn().mockReturnValue({ maybeSingle });
    const eq = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const supabase = asClient({ from });

    await expect(fetchFirstOrgIdForUser(supabase, "u1")).resolves.toBe("org-a");
    expect(from).toHaveBeenCalledWith("organization_members");
  });

  it("returns null when no membership", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const supabase = asClient({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({ maybeSingle }),
          }),
        }),
      }),
    });

    await expect(fetchFirstOrgIdForUser(supabase, "u1")).resolves.toBeNull();
  });
});
