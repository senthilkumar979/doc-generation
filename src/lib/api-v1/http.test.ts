import { describe, expect, it } from "vitest";

import {
  jsonBadRequest,
  jsonNotFound,
  jsonNotImplemented,
  jsonServiceUnavailable,
  jsonUnauthorized,
} from "./http";

describe("api http helpers", () => {
  it("maps status codes via NextResponse payloads", async () => {
    const u = jsonServiceUnavailable();
    expect(u.status).toBe(503);

    const b = jsonBadRequest("oops");
    expect(b.status).toBe(400);
    await expect(u.json()).resolves.toHaveProperty("error");

    const ua = jsonUnauthorized();
    expect(ua.status).toBe(401);

    expect(jsonNotFound("missing").status).toBe(404);

    const n = jsonNotImplemented("later", "x");
    expect(n.status).toBe(501);
    await expect(n.json()).resolves.toMatchObject({ error: { code: "x" } });
  });
});
