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

import { updateTemplateAction } from "./update-template";

describe("updateTemplateAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleId = "123e4567-e89b-12d3-a456-426614174000";

  it("requires sign-in", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never);

    const fd = new FormData();
    fd.set("id", sampleId);
    fd.set("name", "N");
    fd.set("template_type", "blank");
    const r = await updateTemplateAction(undefined, fd);
    expect(r.error).toMatch(/signed in/i);
  });

  it("requires organization", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce(null);

    const fd = new FormData();
    fd.set("id", sampleId);
    fd.set("name", "N");
    fd.set("template_type", "blank");
    const r = await updateTemplateAction(undefined, fd);
    expect(r.error).toMatch(/organization/i);
  });

  it("surfaces template read failures", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: "read fail" } }),
          }),
        }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-1");

    const fd = new FormData();
    fd.set("id", sampleId);
    fd.set("name", "N");
    fd.set("template_type", "blank");

    const r = await updateTemplateAction(undefined, fd);
    expect(r.error).toBe("read fail");
  });

  it("reports missing templates", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-1");

    const fd = new FormData();
    fd.set("id", sampleId);
    fd.set("name", "N");
    fd.set("template_type", "blank");

    const r = await updateTemplateAction(undefined, fd);
    expect(r.error).toMatch(/not found/i);
  });

  it("rejects mismatched organization", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: sampleId, org_id: "org-other" },
              error: null,
            }),
          }),
        }),
      }),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-1");

    const fd = new FormData();
    fd.set("id", sampleId);
    fd.set("name", "N");
    fd.set("template_type", "blank");

    const r = await updateTemplateAction(undefined, fd);
    expect(r.error).toMatch(/not found/i);
  });

  it("maps update errors after read succeeds", async () => {
    const eqOrgScoped = vi.fn().mockResolvedValue({ error: { message: "blocked" } });
    const eqIdScoped = vi.fn().mockReturnValue({ eq: eqOrgScoped });

    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: sampleId, org_id: "org-1" },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({ eq: eqIdScoped }),
      })),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-1");

    const fd = new FormData();
    fd.set("id", sampleId);
    fd.set("name", "N");
    fd.set("template_type", "blank");

    const r = await updateTemplateAction(undefined, fd);
    expect(r.error).toBe("blocked");
  });

  it("updates when org matches", async () => {
    const eqOrgScoped = vi.fn().mockResolvedValue({ error: null });
    const eqIdScoped = vi.fn().mockReturnValue({ eq: eqOrgScoped });

    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: sampleId, org_id: "org-1" },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: eqIdScoped,
        }),
      })),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-1");

    const fd = new FormData();
    fd.set("id", sampleId);
    fd.set("name", "Renamed");
    fd.set("template_type", "blank");

    const r = await updateTemplateAction(undefined, fd);
    expect(r.ok).toBe(true);
    expect(eqIdScoped).toHaveBeenCalledWith("id", sampleId);
    expect(eqOrgScoped).toHaveBeenCalledWith("org_id", "org-1");
    expect(navMocks.revalidatePath).toHaveBeenCalledWith("/dashboard/templates");
  });
});
