import { redirect } from "next/navigation";

import { fetchFirstOrgIdForUser } from "@/lib/orgs/first-org-id";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export interface UserOrgSession {
  user: User;
  orgId: string;
  supabase: Awaited<ReturnType<typeof createServerSupabase>>;
}

export async function requireUserWithOrg(): Promise<
  { ok: true; session: UserOrgSession } | { ok: false; reason: "missing_env" }
> {
  if (!getSupabasePublicEnv()) return { ok: false, reason: "missing_env" };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = await fetchFirstOrgIdForUser(supabase, user.id);
  if (!orgId) redirect("/onboarding/organization");

  return { ok: true, session: { user, orgId, supabase } };
}
