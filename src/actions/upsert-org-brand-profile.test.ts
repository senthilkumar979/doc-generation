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
  replaceLogo: vi.fn(),
  replaceIcon: vi.fn(),
  deleteStoredAssetIfOwned: vi.fn(),
}));

import { deleteStoredAssetIfOwned } from "@/lib/branding/brand-assets-storage";
import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { createServerSupabase } from "@/lib/supabase/server";

import { removeOrgBrandCoreMediaAction, upsertOrgBrandProfileSectionAction } from "./upsert-org-brand-profile";

describe("upsertOrgBrandProfileSectionAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unknown section tokens", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = new FormData();
    fd.set("section", "typography");

    const result = await upsertOrgBrandProfileSectionAction(undefined, fd);
    expect(result).toMatchObject({ error: expect.stringMatching(/invalid section/i) });
  });

  it("requires authentication", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const fd = new FormData();
    fd.set("section", "identity");
    const result = await upsertOrgBrandProfileSectionAction(undefined, fd);
    expect(result).toMatchObject({ error: expect.stringMatching(/signed in/i) });
  });

  it("upserts identity patch", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({ upsert }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-42");

    const fd = new FormData();
    fd.set("section", "identity");
    fd.set("companyName", " Acme Corp ");
    fd.set("legalName", "");
    fd.set("tagline", "");
    fd.set("websiteUrl", "");
    fd.set("supportEmail", "");

    const result = await upsertOrgBrandProfileSectionAction(undefined, fd);
    expect(result).toEqual({ ok: true });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        org_id: "org-42",
        company_name: "Acme Corp",
        legal_name: null,
      }),
      { onConflict: "org_id" },
    );
  });

  it("upserts colors and media sections", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { logo_url: "https://proj.supabase.co/storage/v1/object/public/org-brand-assets/org-42/brand/logo.png", icon_url: null },
    });
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation(() => ({
        upsert,
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle })),
        })),
      })),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-42");

    const colors = new FormData();
    colors.set("section", "colors");
    colors.set("primaryColor", "#ff00aa");
    colors.set("secondaryColor", "");
    colors.set("accentColor", "");
    expect(await upsertOrgBrandProfileSectionAction(undefined, colors)).toEqual({ ok: true });
    expect(upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        primary_color: "#ff00aa",
        secondary_color: null,
      }),
      { onConflict: "org_id" },
    );

    const media = new FormData();
    media.set("section", "media");
    expect(await upsertOrgBrandProfileSectionAction(undefined, media)).toEqual({ ok: true });
    expect(upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        logo_url: "https://proj.supabase.co/storage/v1/object/public/org-brand-assets/org-42/brand/logo.png",
        icon_url: null,
      }),
      { onConflict: "org_id" },
    );
  });

  it("returns Supabase write errors", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: { message: "rls" } });
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({ upsert }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-42");

    const fd = new FormData();
    fd.set("section", "identity");
    fd.set("companyName", "");

    const result = await upsertOrgBrandProfileSectionAction(undefined, fd);
    expect(result).toEqual({ error: "rls" });
  });
});

describe("removeOrgBrandCoreMediaAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects invalid slot values", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-1");

    const fd = new FormData();
    fd.set("slot", "banner");
    const result = await removeOrgBrandCoreMediaAction(undefined, fd);
    expect(result.error).toMatch(/invalid slot/i);
  });

  it("deletes stored assets and nulls logo_url", async () => {
    const url = "https://proj.supabase.co/storage/v1/object/public/org-brand-assets/org-9/brand/logo.png";
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { logo_url: url, icon_url: null },
    });
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle }),
        }),
        update: vi.fn().mockReturnValue({
          eq: updateEq,
        }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValue("org-9");

    const fd = new FormData();
    fd.set("slot", "logo");
    const result = await removeOrgBrandCoreMediaAction(undefined, fd);

    expect(result).toEqual({ ok: true });
    expect(vi.mocked(deleteStoredAssetIfOwned)).toHaveBeenCalledWith(expect.anything(), url);
    expect(updateEq).toHaveBeenCalledWith("org_id", "org-9");
  });
});
