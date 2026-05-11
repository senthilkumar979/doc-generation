import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sbMocks = vi.hoisted(() => ({
  createClient: vi.fn(() => ({ _tag: "test-supabase-client" })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: sbMocks.createClient,
}));

import { createServiceRoleClient, resetServiceRoleClientCache } from "./service-role";

describe("createServiceRoleClient", () => {
  const OLD_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const OLD_SR = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    resetServiceRoleClientCache();
    sbMocks.createClient.mockClear();
  });

  afterEach(() => {
    resetServiceRoleClientCache();
    process.env.NEXT_PUBLIC_SUPABASE_URL = OLD_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = OLD_SR;
  });

  it("returns null without URL", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "srv";
    expect(createServiceRoleClient()).toBeNull();
    expect(sbMocks.createClient).not.toHaveBeenCalled();
  });

  it("memoizes the Supabase singleton when credentials exist", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service_role_xyz";
    const first = createServiceRoleClient();
    const second = createServiceRoleClient();
    expect(first).toEqual({ _tag: "test-supabase-client" });
    expect(first).toBe(second);
    expect(sbMocks.createClient).toHaveBeenCalledTimes(1);
    expect(sbMocks.createClient).toHaveBeenCalledWith(
      "https://abc.supabase.co",
      "service_role_xyz",
      expect.objectContaining({
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }),
    );
  });
});
