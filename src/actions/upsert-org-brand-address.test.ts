import { beforeEach, describe, expect, it, vi } from "vitest";

const navMocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: navMocks.revalidatePath,
}));

vi.mock("@/lib/orgs/first-org-id", () => ({
  fetchFirstOrgIdForUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { createServerSupabase } from "@/lib/supabase/server";

import { deleteOrgBrandAddressAction, upsertOrgBrandAddressAction } from "./upsert-org-brand-address";

function baseFormData(overrides: Partial<Record<string, string>> = {}) {
  const fd = new FormData();
  fd.set("label", overrides.label ?? "HQ");
  fd.set("addressLine1", overrides.addressLine1 ?? "1 Main St");
  fd.set("addressLine2", overrides.addressLine2 ?? "");
  fd.set("city", overrides.city ?? "Boston");
  fd.set("region", overrides.region ?? "MA");
  fd.set("postalCode", overrides.postalCode ?? "02101");
  fd.set("country", overrides.country ?? "US");
  fd.set("isPrimary", overrides.isPrimary ?? "false");
  return fd;
}

describe("upsertOrgBrandAddressAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error for bad id uuid", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = baseFormData();
    fd.set("id", "not-a-uuid");
    const result = await upsertOrgBrandAddressAction(undefined, fd);
    expect(result).toHaveProperty("error");
  });

  it("requires sign-in", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const result = await upsertOrgBrandAddressAction(undefined, baseFormData());
    expect(result).toMatchObject({ error: expect.stringMatching(/signed in/i) });
  });

  it("requires an organization", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue(null);

    const result = await upsertOrgBrandAddressAction(undefined, baseFormData());
    expect(result).toMatchObject({ error: expect.stringMatching(/organization first/i) });
  });

  it("surfaces Supabase errors when clearing primary flags", async () => {
    const clearEq = vi.fn().mockResolvedValue({ error: { message: "clear failed" } });
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: clearEq,
        }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = baseFormData({ isPrimary: "true" });
    const result = await upsertOrgBrandAddressAction(undefined, fd);
    expect(result).toEqual({ error: "clear failed" });
    expect(clearEq).toHaveBeenCalledWith("org_id", "org-1");
  });

  it("inserts when no id and succeeds", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table !== "org_brand_addresses") return {};
        return { update: vi.fn(), insert };
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const result = await upsertOrgBrandAddressAction(undefined, baseFormData());
    expect(insert).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
    expect(navMocks.revalidatePath).toHaveBeenCalledWith("/dashboard/settings/branding");
  });

  it("updates by id when id is present", async () => {
    const secondEq = vi.fn().mockResolvedValue({ error: null });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation(() => ({
        insert: vi.fn(),
        update: vi.fn().mockReturnValue({
          eq: firstEq,
        }),
      })),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = baseFormData();
    fd.set("id", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
    const result = await upsertOrgBrandAddressAction(undefined, fd);
    expect(result).toEqual({ ok: true });
    expect(secondEq).toHaveBeenCalledWith("org_id", "org-1");
  });

  it("returns update errors from the final eq resolution", async () => {
    const secondEq = vi.fn().mockResolvedValue({ error: { message: "missing row" } });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        insert: vi.fn(),
        update: vi.fn().mockReturnValue({ eq: firstEq }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = baseFormData();
    fd.set("id", "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
    const result = await upsertOrgBrandAddressAction(undefined, fd);
    expect(result).toEqual({ error: "missing row" });
  });

  it("returns insert errors", async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: "dup" } });
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        update: vi.fn(),
        insert,
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const result = await upsertOrgBrandAddressAction(undefined, baseFormData());
    expect(result).toEqual({ error: "dup" });
  });

  it("clears competing primaries before inserting when isPrimary=true", async () => {
    const clearEq = vi.fn().mockResolvedValue({ error: null });
    const insert = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table !== "org_brand_addresses") return {};
        return {
          update: vi.fn().mockReturnValue({ eq: clearEq }),
          insert,
        };
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-z");

    const fd = baseFormData({ isPrimary: "true" });
    const result = await upsertOrgBrandAddressAction(undefined, fd);
    expect(result).toEqual({ ok: true });
    expect(clearEq).toHaveBeenCalled();
    expect(insert).toHaveBeenCalled();
  });
});

describe("deleteOrgBrandAddressAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires id", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = new FormData();
    const result = await deleteOrgBrandAddressAction(undefined, fd);
    expect(result).toMatchObject({ error: expect.stringMatching(/required/i) });
  });

  it("deletes and revalidates", async () => {
    const deleteSecondEq = vi.fn().mockResolvedValue({ error: null });
    const deleteFirstEq = vi.fn().mockReturnValue({
      eq: deleteSecondEq,
    });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: deleteFirstEq,
        }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = new FormData();
    fd.set("id", "addr-77");
    const result = await deleteOrgBrandAddressAction(undefined, fd);
    expect(result).toEqual({ ok: true });
    expect(deleteSecondEq).toHaveBeenCalledWith("org_id", "org-1");
  });

  it("returns delete Supabase errors", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: { message: "nope" } }),
          }),
        }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = new FormData();
    fd.set("id", "addr-77");
    const result = await deleteOrgBrandAddressAction(undefined, fd);
    expect(result).toEqual({ error: "nope" });
  });
});
