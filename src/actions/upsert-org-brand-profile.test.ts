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

import { upsertOrgBrandProfileSectionAction } from "./upsert-org-brand-profile";

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
    expect(result.error).toMatch(/invalid section/i);
  });

  it("requires authentication", async () => {
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const fd = new FormData();
    fd.set("section", "identity");
    const result = await upsertOrgBrandProfileSectionAction(undefined, fd);
    expect(result.error).toMatch(/signed in/i);
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
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({ upsert }),
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
    media.set("logoUrl", "https://x.example/l.png");
    media.set("iconUrl", "");
    expect(await upsertOrgBrandProfileSectionAction(undefined, media)).toEqual({ ok: true });
    expect(upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        logo_url: "https://x.example/l.png",
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
    expect(result.error).toBe("rls");
  });
});
