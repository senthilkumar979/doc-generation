import Link from "next/link";

import { ApiKeysPanel, type ApiKeyListItem } from "@/components/dashboard/ApiKeysPanel";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export default async function ApiKeysPage() {
  if (!getSupabasePublicEnv()) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">API keys</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Add Supabase environment variables — see README.
        </p>
      </main>
    );
  }

  const gate = await requireUserWithOrg();
  if (!gate.ok) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">API keys</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Supabase configuration is unavailable. Reload after applying env vars.
        </p>
      </main>
    );
  }

  const { session } = gate;
  const { data: rows, error } = await session.supabase
    .from("api_keys")
    .select("id,name,key_prefix,created_at,revoked_at")
    .eq("org_id", session.orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">API keys</h1>
        <p className="mt-2 text-sm text-red-600">
          Could not load keys ({error.message}). If you haven’t run the latest Supabase migration, apply{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">20250511153000_api_keys.sql</code>.
        </p>
      </main>
    );
  }

  const keys = (rows ?? []) as ApiKeyListItem[];

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-sm">
        <Link href="/dashboard" className="text-zinc-600 underline dark:text-zinc-400">
          Dashboard
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">API keys</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Secrets are hashed in the database. You only see the full value once after creation.
      </p>
      <div className="mt-8">
        <ApiKeysPanel keys={keys} />
      </div>
    </main>
  );
}
