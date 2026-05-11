import type { User } from "@supabase/supabase-js";

export function getProfileDisplayName(user: User): string {
  const full = user.user_metadata?.full_name;
  if (typeof full === "string" && full.trim()) return full.trim();
  const email = user.email;
  if (email) {
    const local = email.split("@")[0];
    if (local) return local;
    return email;
  }
  return "Account";
}
