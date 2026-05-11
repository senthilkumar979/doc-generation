import { afterEach, describe, expect, it, vi } from "vitest";

const browserMocks = vi.hoisted(() => ({
  createBrowserClient: vi.fn(() => ({ kind: "browser" as const })),
}));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: browserMocks.createBrowserClient,
}));

import { createBrowserSupabase } from "./browser";

const validUrl = "https://abc.supabase.co";
const validKey = "x".repeat(20);

describe("createBrowserSupabase", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("throws when env missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(() => createBrowserSupabase()).toThrow(/Missing NEXT_PUBLIC_SUPABASE/);
  });

  it("creates a browser client when env is valid", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", validUrl);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", validKey);

    const client = createBrowserSupabase();

    expect(browserMocks.createBrowserClient).toHaveBeenCalledWith(validUrl, validKey);
    expect(client).toEqual({ kind: "browser" });
  });
});
