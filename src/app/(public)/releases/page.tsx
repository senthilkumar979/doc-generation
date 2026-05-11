import type { Metadata } from "next";

import { ReleasesIndexBreadcrumbs } from "@/components/releases/releases-breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";
import { TextLink } from "@/components/ui/text-link";
import { listReleaseEntries } from "@/lib/releases/io";

export const metadata: Metadata = {
  title: "Release notes | DocRail",
  description: "Public release history for DocRail.",
};

export default async function ReleasesIndexPage() {
  const entries = await listReleaseEntries();

  return (
    <PageMain className="min-h-0">
      <ReleasesIndexBreadcrumbs />
      <Heading>Release notes</Heading>
      <Text muted className="mt-3 max-w-xl">
        User-facing changes only. No sensitive operational detail is published here.
      </Text>
      <ul className="mt-10 space-y-4">
        {entries.map((e) => (
          <li key={e.slug} className="text-sm leading-relaxed">
            <TextLink href={`/releases/${e.slug}`} variant="accent" className="text-base">
              {e.title}
            </TextLink>
            <span className="text-muted-foreground ml-2 font-mono text-xs">{e.slug}</span>
          </li>
        ))}
      </ul>
      {entries.length === 0 ? <Text muted className="mt-10 text-sm">No releases published yet.</Text> : null}
    </PageMain>
  );
}
