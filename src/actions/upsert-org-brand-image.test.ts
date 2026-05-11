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

import { deleteOrgBrandImageAction, upsertOrgBrandImageAction } from "./upsert-org-brand-image";

function imageForm(extra: Partial<Record<string, string>> = {}) {
  const fd = new FormData();
  fd.set("label", extra.label ?? "Banner");
  fd.set("imageType", extra.imageType ?? "general");
  fd.set("imageUrl", extra.imageUrl ?? "https://cdn.example/logo.png");
  if (extra.id != null) fd.set("id", extra.id);
  return fd;
}

describe("upsertOrgBrandImageAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects invalid image URLs from the shared urlLike rules", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = imageForm({ imageUrl: "not-a-url" });
    const result = await upsertOrgBrandImageAction(undefined, fd);
    expect(result).toHaveProperty("error");
  });

  it("rejects invalid image type via schema", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = imageForm({ imageType: "wallpaper" });
    const result = await upsertOrgBrandImageAction(undefined, fd);
    expect(result).toHaveProperty("error");
  });

  it("needs session and org like other branding actions", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const result = await upsertOrgBrandImageAction(undefined, imageForm());
    expect(result.error).toMatch(/signed in/i);
  });

  it("inserts new image rows", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table !== "org_brand_images") return {};
        return {
          insert,
          update: vi.fn(),
        };
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const result = await upsertOrgBrandImageAction(undefined, imageForm());
    expect(insert).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it("returns Supabase failures from insert", async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: "blocked" } });
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table !== "org_brand_images") return {};
        return { insert, update: vi.fn() };
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const result = await upsertOrgBrandImageAction(undefined, imageForm());
    expect(result.error).toBe("blocked");
  });

  it("updates by id using chained eq filters", async () => {
    const secondEq = vi.fn().mockResolvedValue({ error: null });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        insert: vi.fn(),
        update: vi.fn().mockReturnValue({ eq: firstEq }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = imageForm({ id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" });
    const result = await upsertOrgBrandImageAction(undefined, fd);
    expect(result).toEqual({ ok: true });
    expect(secondEq).toHaveBeenCalledWith("org_id", "org-1");
  });

  it("returns chained update failures", async () => {
    const secondEq = vi.fn().mockResolvedValue({ error: { message: "conflict" } });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        insert: vi.fn(),
        update: vi.fn().mockReturnValue({ eq: firstEq }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = imageForm({ id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" });
    expect(await upsertOrgBrandImageAction(undefined, fd)).toEqual({ error: "conflict" });
  });
});

describe("deleteOrgBrandImageAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires id", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const result = await deleteOrgBrandImageAction(undefined, new FormData());
    expect(result.error).toMatch(/required/i);
  });

  it("surfaces Supabase failures from delete", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: { message: "rls" } }),
          }),
        }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = new FormData();
    fd.set("id", "img-77");
    const result = await deleteOrgBrandImageAction(undefined, fd);
    expect(result.error).toBe("rls");
  });

  it("deletes by id and org", async () => {
    const secondEq = vi.fn().mockResolvedValue({ error: null });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({ eq: firstEq }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = new FormData();
    fd.set("id", "img-1");
    const result = await deleteOrgBrandImageAction(undefined, fd);
    expect(result).toEqual({ ok: true });
    expect(navMocks.revalidatePath).toHaveBeenCalled();
  });
});
