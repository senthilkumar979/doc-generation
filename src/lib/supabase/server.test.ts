import { describe, expect, it, vi, beforeEach } from "vitest";

const serverMocks = vi.hoisted(() => {
  const getAll = vi.fn(() => [] as { name: string; value: string }[]);
  const set = vi.fn();
  const cookiesFn = vi.fn(async () => ({ getAll, set }));
  const createServerClient = vi.fn(() => ({
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  }));
  return { getAll, set, cookiesFn, createServerClient };
});

vi.mock("next/headers", () => ({
  cookies: serverMocks.cookiesFn,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: serverMocks.createServerClient,
}));

vi.mock("./env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./env")>();
  return {
    ...actual,
    requireSupabasePublicEnv: vi.fn(() => ({
      url: "https://project.supabase.co",
      publicApiKey: "k".repeat(20),
    })),
  };
});

import { createServerSupabase } from "./server";

describe("createServerSupabase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serverMocks.getAll.mockReturnValue([]);
    serverMocks.set.mockReset();
  });

  it("creates a client with cookie helpers wired to next/headers", async () => {
    serverMocks.getAll.mockReturnValue([{ name: "s", value: "1" }]);

    await createServerSupabase();

    expect(serverMocks.cookiesFn).toHaveBeenCalled();
    expect(serverMocks.createServerClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "k".repeat(20),
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );

    expect(serverMocks.createServerClient).toHaveBeenCalled();
    const [, , options] = serverMocks.createServerClient.mock.calls[0] as unknown as [
      string,
      string,
      {
        cookies: {
          getAll: () => ReturnType<typeof serverMocks.getAll>;
          setAll: (cookies: { name: string; value: string; options?: object }[]) => void;
        };
      },
    ];
    expect(options.cookies.getAll()).toEqual([{ name: "s", value: "1" }]);
    options.cookies.setAll([{ name: "a", value: "b", options: { path: "/" } }]);
    expect(serverMocks.set).toHaveBeenCalledWith("a", "b", { path: "/" });
  });

  it("swallows cookie set errors from Server Components", async () => {
    await createServerSupabase();

    expect(serverMocks.createServerClient).toHaveBeenCalled();
    const [, , options] = serverMocks.createServerClient.mock.calls[0] as unknown as [
      string,
      string,
      { cookies: { setAll: (cookies: unknown[]) => void } },
    ];
    serverMocks.set.mockImplementation(() => {
      throw new Error("cannot mutate cookies");
    });
    expect(() =>
      options.cookies.setAll([{ name: "a", value: "b", options: {} }]),
    ).not.toThrow();
  });
});
