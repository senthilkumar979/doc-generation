import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./log-api-usage", () => ({
  logApiUsage: vi.fn(),
}));

import { tryLogApiUsage } from "./async-log-usage";
import { logApiUsage } from "./log-api-usage";

describe("tryLogApiUsage", () => {
  beforeEach(() => {
    vi.mocked(logApiUsage).mockReset();
  });

  it("delegates successful inserts", async () => {
    vi.mocked(logApiUsage).mockResolvedValue(undefined);

    await tryLogApiUsage({} as never, {
      orgId: "o",
      apiKeyId: null,
      route: "/",
      method: "GET",
      statusCode: 200,
      durationMs: 1,
    });

    expect(logApiUsage).toHaveBeenCalledTimes(1);
  });

  it("suppresses logging failures", async () => {
    vi.mocked(logApiUsage).mockRejectedValueOnce(new Error("boom"));

    await expect(
      tryLogApiUsage({} as never, {
        orgId: "o",
        apiKeyId: null,
        route: "/",
        method: "GET",
        statusCode: 200,
        durationMs: 1,
      }),
    ).resolves.toBeUndefined();
  });
});
