import { redirect } from "next/navigation";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DashboardPage() {
  if (!getSupabasePublicEnv()) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Add <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NEXT_PUBLIC_SUPABASE_URL</code> and either{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
          (recommended) or <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          to <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.env.local</code>.
        </p>
      </main>
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1);

  if (!memberships?.length) {
    redirect("/onboarding/organization");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Signed in as {user.email}</p>
      <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
        Next: templates, API keys, and document rendering will appear here as we ship milestones.
      </p>
    </main>
  );
}
