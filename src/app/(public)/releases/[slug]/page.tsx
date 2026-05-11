import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarkdownView } from "@/components/releases/MarkdownView";
import { listReleaseEntries, readReleaseDocument } from "@/lib/releases/io";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const entries = await listReleaseEntries();
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const doc = await readReleaseDocument(slug);
  if (!doc) return { title: "Not found | DocRail" };
  return { title: `${doc.title} | DocRail` };
}

export default async function ReleaseDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const doc = await readReleaseDocument(slug);
  if (!doc) notFound();
  return (
    <div className="mx-auto flex min-h-0 max-w-2xl flex-1 flex-col px-4 py-12">
      <Link href="/releases" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← All releases
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{doc.title}</h1>
      <p className="text-sm text-zinc-500">Version {doc.slug}</p>
      <div className="mt-8">
        <MarkdownView source={doc.bodyMarkdown} />
      </div>
    </div>
  );
}
