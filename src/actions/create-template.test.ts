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

import { createTemplateAction } from "./create-template";

describe("createTemplateAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation errors from form parse", async () => {
    const fd = new FormData();
    fd.set("name", "");
    fd.set("template_type", "blank");
    const r = await createTemplateAction(undefined, fd);
    expect(r.error).toContain("Name");
  });

  it("requires sign-in", async () => {
    const fd = new FormData();
    fd.set("name", "Hello");
    fd.set("template_type", "letter");
    fd.set("subject", "Subj");
    fd.set("content", "Hey");
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never);
    const r = await createTemplateAction(undefined, fd);
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
    fd.set("name", "Hello");
    fd.set("template_type", "blank");
    const r = await createTemplateAction(undefined, fd);
    expect(r.error).toMatch(/organization/i);
  });

  it("maps insert errors from Supabase", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        insert: vi.fn().mockResolvedValue({ error: { message: "duplicate name" } }),
      })),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-1");

    const fd = new FormData();
    fd.set("name", "Dup");
    fd.set("template_type", "blank");

    const r = await createTemplateAction(undefined, fd);
    expect(r.error).toBe("duplicate name");
  });

  it("inserts and revalidates on success", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-1");

    const fd = new FormData();
    fd.set("name", "Letter");
    fd.set("template_type", "letter");
    fd.set("subject", "S");
    fd.set("content", "C");

    const r = await createTemplateAction(undefined, fd);
    expect(r.ok).toBe(true);
    expect(navMocks.revalidatePath).toHaveBeenCalledWith("/dashboard/templates");
  });
});
