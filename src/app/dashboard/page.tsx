import Link from "next/link";

import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

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

  const gate = await requireUserWithOrg();
  if (!gate.ok) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Supabase client configuration is unavailable. Reload after setting env vars — see README.
        </p>
      </main>
    );
  }

  const { user } = gate.session;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Signed in as {user.email}</p>
      <ul className="mt-8 space-y-2 text-sm">
        <li>
          <Link href="/dashboard/api-keys" className="font-medium text-zinc-900 underline dark:text-zinc-50">
            API keys
          </Link>
          <span className="text-zinc-600 dark:text-zinc-400"> — create and revoke keys for the render API.</span>
        </li>
        <li>
          <Link href="/dashboard/templates" className="font-medium text-zinc-900 underline dark:text-zinc-50">
            Templates
          </Link>
          <span className="text-zinc-600 dark:text-zinc-400"> — blank or letter payloads with PDF preview.</span>
        </li>
      </ul>
      <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
        Next: REST render API (`/api/v1`) wired to templates and Trigger.dev PDF jobs.
      </p>
    </main>
  );
}
