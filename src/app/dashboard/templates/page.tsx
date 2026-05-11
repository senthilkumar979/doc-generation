import Link from "next/link";

import { TemplatesPanel } from "@/components/templates/TemplatesPanel";
import type { TemplateRowDto } from "@/components/templates/template-row-dto";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { isTemplateType } from "@/lib/templates/constants";

export default async function TemplatesPage() {
  if (!getSupabasePublicEnv()) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Templates</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Configure Supabase env vars — see README.</p>
      </main>
    );
  }

  const gate = await requireUserWithOrg();
  if (!gate.ok) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Templates</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Supabase configuration is unavailable. Reload after applying env vars.
        </p>
      </main>
    );
  }

  const { session } = gate;
  const { data: rows, error } = await session.supabase
    .from("templates")
    .select("id,name,template_type,payload,updated_at")
    .eq("org_id", session.orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Templates</h1>
        <p className="mt-2 text-sm text-red-600">
          Could not load templates ({error.message}). Apply{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">20250511160000_templates.sql</code>{" "}
          if you haven’t yet.
        </p>
      </main>
    );
  }

  const templates: TemplateRowDto[] =
    rows?.flatMap((r) =>
      typeof r.template_type === "string" &&
      typeof r.name === "string" &&
      typeof r.id === "string" &&
      isTemplateType(r.template_type)
        ? [{ id: r.id, name: r.name, template_type: r.template_type, payload: r.payload }]
        : [],
    ) ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-sm">
        <Link href="/dashboard" className="text-zinc-600 underline dark:text-zinc-400">
          Dashboard
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Templates</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Letter templates use validated fields and ship with an in-browser PDF preview (React-PDF).
      </p>
      <div className="mt-10">
        <TemplatesPanel templates={templates} />
      </div>
    </main>
  );
}
