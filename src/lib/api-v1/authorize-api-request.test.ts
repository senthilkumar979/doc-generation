import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock("./verify-plaintext-api-key", () => ({
  verifyPlaintextApiKey: vi.fn(),
}));

import { createServiceRoleClient } from "@/lib/supabase/service-role";

import { authorizeApiRequest } from "./authorize-api-request";
import { verifyPlaintextApiKey } from "./verify-plaintext-api-key";

describe("authorizeApiRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 without service credentials", async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(null);

    const res = await authorizeApiRequest(new Request("https://x/"));
    expect(res instanceof Response).toBe(true);
    expect((res as Response).status).toBe(503);
  });

  it("returns 401 without Bearer token when client exists", async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({} as never);

    const res = await authorizeApiRequest(new Request("https://x/"));
    expect(res instanceof Response).toBe(true);
    expect((res as Response).status).toBe(401);
  });

  it("returns 401 when verify fails", async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({} as never);
    vi.mocked(verifyPlaintextApiKey).mockResolvedValueOnce(null);

    const res = await authorizeApiRequest(
      new Request("https://x/", { headers: { Authorization: "Bearer key" } }),
    );
    expect(res instanceof Response).toBe(true);
    expect((res as Response).status).toBe(401);
  });

  it("returns caller context when verify succeeds", async () => {
    const client = {};
    vi.mocked(createServiceRoleClient).mockReturnValue(client as never);
    vi.mocked(verifyPlaintextApiKey).mockResolvedValueOnce({ apiKeyId: "k", orgId: "o" });

    const auth = await authorizeApiRequest(
      new Request("https://x/", { headers: { Authorization: "Bearer z" } }),
    );

    expect(auth instanceof Response).toBe(false);
    if (!auth || auth instanceof Response) throw new Error("expected auth object");
    expect(auth).toEqual({ supabase: client, apiKeyId: "k", orgId: "o" });
  });
});
