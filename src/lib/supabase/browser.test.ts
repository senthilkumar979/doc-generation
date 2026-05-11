import { afterEach, describe, expect, it, vi } from "vitest";
import { createBrowserSupabase } from "./browser";

describe("createBrowserSupabase", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when env missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(() => createBrowserSupabase()).toThrow(/Missing NEXT_PUBLIC_SUPABASE/);
  });
});
