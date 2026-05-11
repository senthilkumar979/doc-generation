import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabasePublicEnv, requireSupabasePublicEnv } from "./env";

const validUrl = "https://abc.supabase.co";
const validKey = "x".repeat(20);

describe("getSupabasePublicEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when vars missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(getSupabasePublicEnv()).toBeNull();
  });

  it("accepts legacy anon key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", validUrl);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", validKey);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(getSupabasePublicEnv()).toEqual({ url: validUrl, publicApiKey: validKey });
  });

  it("prefers publishable key when both are set", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", validUrl);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "p".repeat(20));
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", validKey);
    expect(getSupabasePublicEnv()?.publicApiKey).toBe("p".repeat(20));
  });

  it("accepts publishable key alone", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", validUrl);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "s".repeat(20));
    expect(getSupabasePublicEnv()).toEqual({ url: validUrl, publicApiKey: "s".repeat(20) });
  });
});

describe("requireSupabasePublicEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(() => requireSupabasePublicEnv()).toThrow(/Missing NEXT_PUBLIC_SUPABASE/);
  });
});
