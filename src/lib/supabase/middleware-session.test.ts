import { describe, expect, it, vi, beforeEach } from "vitest";

/** @vitest-environment node */

import { NextRequest } from "next/server";

const mockCreateServerClient = vi.hoisted(() =>
  vi.fn((_url: string, _key: string, opts: { cookies: { getAll: () => unknown[]; setAll: (cookies: unknown[]) => void } }) => {
    opts.cookies.getAll();
    opts.cookies.setAll([{ name: "sb-auth", value: "x", options: { path: "/" } }]);
    return {
      auth: {
        getUser: mockGetUser,
      },
    };
  }),
);

const mockGetUser = vi.hoisted(() => vi.fn());

vi.mock("@supabase/ssr", () => ({
  createServerClient: mockCreateServerClient,
}));

import { updateSession } from "./middleware-session";

const env = {
  url: "https://project.supabase.co",
  publicApiKey: "k".repeat(20),
};

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockReset();
  });

  it("returns next response when no auth redirect applies", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const request = new NextRequest(new Request("https://app.example.com/releases"));

    const res = await updateSession(request, env);

    expect(res.status).toBe(200);
    expect(mockCreateServerClient).toHaveBeenCalled();
  });

  it("redirects unauthenticated visitors away from auth-required routes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new NextRequest(new Request("https://app.example.com/dashboard"));

    const res = await updateSession(request, env);

    expect(res.status).toBe(307);
    const loc = res.headers.get("location");
    expect(loc).toContain("/login?");
    expect(loc).toContain(encodeURIComponent("/dashboard"));
  });

  it("redirects signed-in users away from auth pages", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const request = new NextRequest(new Request("https://app.example.com/login"));

    const res = await updateSession(request, env);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(new URL("/dashboard", request.url).href);
  });
});
