import Link from "next/link";
import type { Metadata } from "next";

import { listReleaseEntries } from "@/lib/releases/io";

export const metadata: Metadata = {
  title: "Release notes | DocRail",
  description: "Public release history for DocRail.",
};

export default async function ReleasesIndexPage() {
  const entries = await listReleaseEntries();
  return (
    <div className="mx-auto flex min-h-0 max-w-2xl flex-1 flex-col px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Release notes</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        User-facing changes only. No sensitive operational detail is published here.
      </p>
      <ul className="mt-8 space-y-3">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/releases/${e.slug}`}
              className="text-base font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {e.title}
            </Link>
            <span className="ml-2 text-sm text-zinc-500">{e.slug}</span>
          </li>
        ))}
      </ul>
      {entries.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">No releases published yet.</p>
      ) : null}
    </div>
  );
}
