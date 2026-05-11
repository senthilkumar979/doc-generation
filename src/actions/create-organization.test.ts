import { describe, expect, it } from "vitest";
import { createOrganizationAction } from "./create-organization";

describe("createOrganizationAction", () => {
  it("returns validation error for short name", async () => {
    const fd = new FormData();
    fd.set("name", "a");
    const result = await createOrganizationAction(undefined, fd);
    expect(result.error).toMatch(/2–120/);
  });
});
