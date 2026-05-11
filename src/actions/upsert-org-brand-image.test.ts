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

vi.mock("@/lib/branding/brand-assets-storage", () => ({
  replaceAdditionalBrandImage: vi.fn().mockResolvedValue({
    publicUrl: "https://proj.supabase.co/storage/v1/object/public/org-brand-assets/org-1/brand/additional/n.png",
  }),
  deleteStoredAssetIfOwned: vi.fn().mockResolvedValue(undefined),
}));

import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import {
  deleteStoredAssetIfOwned,
  replaceAdditionalBrandImage,
} from "@/lib/branding/brand-assets-storage";
import { createServerSupabase } from "@/lib/supabase/server";

import { deleteOrgBrandImageAction, upsertOrgBrandImageAction } from "./upsert-org-brand-image";

function pngFile() {
  return new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "x.png", { type: "image/png" });
}

function imageForm(extra: Partial<{ id: string }> = {}) {
  const fd = new FormData();
  fd.set("label", "Banner");
  fd.set("imageType", "general");
  fd.append("imageFile", pngFile());
  if (extra.id != null) fd.set("id", extra.id);
  return fd;
}

describe("upsertOrgBrandImageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid image type via schema", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = new FormData();
    fd.set("label", "X");
    fd.set("imageType", "wallpaper");
    fd.append("imageFile", pngFile());

    const result = await upsertOrgBrandImageAction(undefined, fd);
    expect(result).toMatchObject({ error: expect.any(String) });
  });

  it("needs session and org like other branding actions", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const result = await upsertOrgBrandImageAction(undefined, imageForm());
    expect(result).toMatchObject({ error: expect.stringMatching(/signed in/i) });
  });

  it("requires a file for new rows", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn(),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = new FormData();
    fd.set("label", "A");
    fd.set("imageType", "general");
    const result = await upsertOrgBrandImageAction(undefined, fd);
    expect(result).toEqual({ error: "Choose an image file to upload." });
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
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) })),
            })),
          })),
        };
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const result = await upsertOrgBrandImageAction(undefined, imageForm());
    expect(insert).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
    expect(vi.mocked(replaceAdditionalBrandImage)).toHaveBeenCalled();
  });

  it("returns Supabase failures from insert", async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: "blocked" } });
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table !== "org_brand_images") return {};
        return {
          insert,
          update: vi.fn(),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) })),
            })),
          })),
        };
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const result = await upsertOrgBrandImageAction(undefined, imageForm());
    expect(result).toEqual({ error: "blocked" });
  });

  it("updates by id using chained eq filters", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { image_url: "https://proj.supabase.co/storage/v1/object/public/org-brand-assets/org-1/brand/additional/old.png" },
    });
    const secondEq = vi.fn().mockResolvedValue({ error: null });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        insert: vi.fn(),
        update: vi.fn().mockReturnValue({ eq: firstEq }),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle })),
          })),
        })),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const fd = imageForm({ id });
    const result = await upsertOrgBrandImageAction(undefined, fd);
    expect(result).toEqual({ ok: true });
    expect(secondEq).toHaveBeenCalledWith("org_id", "org-1");
    expect(vi.mocked(deleteStoredAssetIfOwned)).toHaveBeenCalled();
  });

  it("returns chained update failures", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { image_url: "https://cdn.example/old.png" } });
    const secondEq = vi.fn().mockResolvedValue({ error: { message: "conflict" } });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        insert: vi.fn(),
        update: vi.fn().mockReturnValue({ eq: firstEq }),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle })),
          })),
        })),
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
    expect(result).toMatchObject({ error: expect.stringMatching(/required/i) });
  });

  it("surfaces Supabase failures from delete", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: { image_url: null } }),
            })),
          })),
        })),
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
    expect(result).toEqual({ error: "rls" });
  });

  it("deletes by id and org", async () => {
    const secondEq = vi.fn().mockResolvedValue({ error: null });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });

    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  image_url:
                    "https://proj.supabase.co/storage/v1/object/public/org-brand-assets/org-1/brand/additional/img.png",
                },
              }),
            })),
          })),
        })),
        delete: vi.fn().mockReturnValue({ eq: firstEq }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = new FormData();
    fd.set("id", "img-1");
    const result = await deleteOrgBrandImageAction(undefined, fd);
    expect(result).toEqual({ ok: true });
    expect(navMocks.revalidatePath).toHaveBeenCalled();
    expect(vi.mocked(deleteStoredAssetIfOwned)).toHaveBeenCalled();
  });
});
