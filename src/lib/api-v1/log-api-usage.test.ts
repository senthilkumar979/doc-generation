import { describe, expect, it, vi } from "vitest";

import { logApiUsage } from "./log-api-usage";

describe("logApiUsage", () => {
  it("inserts structured rows", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    const supabase = { from };

    await logApiUsage(supabase as never, {
      orgId: "org-1",
      apiKeyId: "kid",
      route: "/x",
      method: "GET",
      statusCode: 200,
      durationMs: 5,
    });

    expect(from).toHaveBeenCalledWith("api_usage_logs");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        org_id: "org-1",
        api_key_id: "kid",
        route: "/x",
        http_method: "GET",
        status_code: 200,
        duration_ms: 5,
      }),
    );
  });

  it("throws on insert failure", async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: "nope" } });
    const supabase = { from: vi.fn().mockReturnValue({ insert }) } as never;

    await expect(
      logApiUsage(supabase, {
        orgId: "o",
        apiKeyId: null,
        route: "/",
        method: "POST",
        statusCode: 500,
        durationMs: 1,
      }),
    ).rejects.toThrow(/api_usage_logs/);
  });
});
