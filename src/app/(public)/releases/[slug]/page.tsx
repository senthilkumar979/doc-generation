import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarkdownView } from "@/components/releases/MarkdownView";
import { Heading } from "@/components/ui/heading";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";
import { TextLink } from "@/components/ui/text-link";
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
    <PageMain className="min-h-0">
      <div className="text-sm leading-none">
        <TextLink href="/releases" variant="muted">
          ← All releases
        </TextLink>
      </div>
      <Heading className="mt-6">{doc.title}</Heading>
      <Text muted className="mt-2 font-mono text-xs tracking-tight">
        Version {doc.slug}
      </Text>
      <div className="mt-10">
        <MarkdownView source={doc.bodyMarkdown} />
      </div>
    </PageMain>
  );
}
