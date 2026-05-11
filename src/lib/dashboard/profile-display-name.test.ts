import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { getProfileDisplayName } from "./profile-display-name";

function user(partial: Partial<User>): User {
  return {
    ...partial,
  } as User;
}

describe("getProfileDisplayName", () => {
  it("prefers trimmed full_name metadata", () => {
    expect(
      getProfileDisplayName(
        user({ user_metadata: { full_name: "  Ada Lovelace  " }, email: "ada@example.com" }),
      ),
    ).toBe("Ada Lovelace");
  });

  it("falls back to email local-part", () => {
    expect(getProfileDisplayName(user({ email: "ada@example.com", user_metadata: {} }))).toBe("ada");
  });

  it("uses full email when local-part is empty", () => {
    expect(getProfileDisplayName(user({ email: "@example.com", user_metadata: {} }))).toBe("@example.com");
  });

  it("returns Account when no usable name or email", () => {
    expect(getProfileDisplayName(user({ email: undefined, user_metadata: {} }))).toBe("Account");
  });
});
