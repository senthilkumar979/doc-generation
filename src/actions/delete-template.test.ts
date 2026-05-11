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

import { deleteTemplateAction } from "./delete-template";

describe("deleteTemplateAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const id = "123e4567-e89b-12d3-a456-426614174000";

  it("requires sign-in", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never);

    const fd = new FormData();
    fd.set("id", id);
    const r = await deleteTemplateAction(undefined, fd);
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
    fd.set("id", id);
    const r = await deleteTemplateAction(undefined, fd);
    expect(r.error).toMatch(/organization/i);
  });

  it("maps delete errors from Supabase", async () => {
    const eqOrgScoped = vi.fn().mockResolvedValue({ error: { message: "rls" } });
    const eqIdScoped = vi.fn().mockReturnValue({ eq: eqOrgScoped });

    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        delete: vi.fn().mockReturnValue({ eq: eqIdScoped }),
      })),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-2");

    const fd = new FormData();
    fd.set("id", id);
    const r = await deleteTemplateAction(undefined, fd);
    expect(r.error).toBe("rls");
  });

  it("rejects malformed id", async () => {
    const fd = new FormData();
    fd.set("id", "nope");
    const r = await deleteTemplateAction(undefined, fd);
    expect(r.error).toMatch(/Invalid/i);
  });

  it("deletes scoped to org when signed in", async () => {
    const eqOrgScoped = vi.fn().mockResolvedValue({ error: null });
    const eqIdScoped = vi.fn().mockReturnValue({ eq: eqOrgScoped });

    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        delete: vi.fn().mockReturnValue({
          eq: eqIdScoped,
        }),
      })),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-2");

    const fd = new FormData();
    fd.set("id", id);
    const r = await deleteTemplateAction(undefined, fd);
    expect(r.ok).toBe(true);
    expect(eqIdScoped).toHaveBeenCalledWith("id", id);
    expect(eqOrgScoped).toHaveBeenCalledWith("org_id", "org-2");
    expect(navMocks.revalidatePath).toHaveBeenCalledWith("/dashboard/templates");
  });
});
