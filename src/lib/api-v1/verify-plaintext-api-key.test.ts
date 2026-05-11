import { describe, expect, it, vi } from "vitest";

import { hashApiKeySecret, formatApiKeyPrefix } from "@/lib/api-keys/secret";

import { verifyPlaintextApiKey } from "./verify-plaintext-api-key";

describe("verifyPlaintextApiKey", () => {
  it("matches a row when hashes align", async () => {
    const secret = "docr_live_testsecret";
    const digest = hashApiKeySecret(secret);
    const prefix = formatApiKeyPrefix(secret);

    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({
              data: [{ id: "key-1", org_id: "org-9", secret_hash: digest }],
              error: null,
            }),
          }),
        }),
      }),
    } as never;

    await expect(verifyPlaintextApiKey(supabase, secret)).resolves.toEqual({
      apiKeyId: "key-1",
      orgId: "org-9",
    });
    expect(prefix.length).toBeGreaterThan(0);
  });

  it("returns null when hashes never match candidate rows", async () => {
    const secret = "docr_live_x";
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({
              data: [{ id: "k", org_id: "o", secret_hash: "0".repeat(64) }],
              error: null,
            }),
          }),
        }),
      }),
    } as never;

    await expect(verifyPlaintextApiKey(supabase, secret)).resolves.toBeNull();
  });

  it("skips rows with unexpected column types", async () => {
    const secret = "docr_live_x";
    const digest = hashApiKeySecret(secret);
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({
              data: [{ id: 123, org_id: "o", secret_hash: digest }],
              error: null,
            }),
          }),
        }),
      }),
    } as never;

    await expect(verifyPlaintextApiKey(supabase, secret)).resolves.toBeNull();
  });

  it("returns null when no candidates", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    } as never;

    await expect(verifyPlaintextApiKey(supabase, "any")).resolves.toBeNull();
  });
});
