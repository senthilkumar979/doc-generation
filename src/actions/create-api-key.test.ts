import { beforeEach, describe, expect, it, vi } from "vitest";

const navMocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/api-keys/secret", () => ({
  buildApiKeyPlaintext: vi.fn(() => "docr_live_fixedplaintext"),
  formatApiKeyPrefix: vi.fn(() => "docr_live_fixedplainte"),
  hashApiKeySecret: vi.fn(() => "b".repeat(64)),
}));

vi.mock("@/lib/orgs/first-org-id", () => ({
  fetchFirstOrgIdForUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: navMocks.revalidatePath,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

import * as apiKeySecret from "@/lib/api-keys/secret";
import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { createServerSupabase } from "@/lib/supabase/server";

import { createApiKeyAction } from "./create-api-key";

describe("createApiKeyAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error for empty label", async () => {
    const fd = new FormData();
    fd.set("name", "  ");
    const result = await createApiKeyAction(undefined, fd);
    expect(result.error).toMatch(/1–80/);
  });

  it("returns error when not signed in", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never);
    const fd = new FormData();
    fd.set("name", "Prod");
    const result = await createApiKeyAction(undefined, fd);
    expect(result.error).toMatch(/signed in/i);
  });

  it("returns error when user has no organization", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce(null);
    const fd = new FormData();
    fd.set("name", "Prod");
    const result = await createApiKeyAction(undefined, fd);
    expect(result.error).toMatch(/organization first/i);
  });

  it("inserts key and reveals plaintext once", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "key-77" },
              error: null,
            }),
          }),
        }),
      })),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-1");

    const fd = new FormData();
    fd.set("name", "Staging");
    const result = await createApiKeyAction(undefined, fd);

    expect(result.revealed).toEqual({
      id: "key-77",
      plaintext: "docr_live_fixedplaintext",
      name: "Staging",
    });
    expect(navMocks.revalidatePath).toHaveBeenCalledWith("/dashboard/api-keys");
    expect(apiKeySecret.buildApiKeyPlaintext).toHaveBeenCalled();
  });

  it("maps insert errors", async () => {
    vi.mocked(createServerSupabase).mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "duplicate" },
            }),
          }),
        }),
      })),
    } as never);
    vi.mocked(fetchFirstOrgIdForUser).mockResolvedValueOnce("org-1");

    const fd = new FormData();
    fd.set("name", "X");
    const result = await createApiKeyAction(undefined, fd);
    expect(result.error).toBe("duplicate");
  });
});
