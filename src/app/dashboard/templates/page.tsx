import { CreateBuilderTemplateButton } from "@/components/templates/CreateBuilderTemplateButton";
import { TemplatesPanel } from "@/components/templates/TemplatesPanel";
import type { TemplateRowDto } from "@/components/templates/template-row-dto";
import { Heading } from "@/components/ui/heading";
import { InlineCode } from "@/components/ui/inline-code";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";
import { TextLink } from "@/components/ui/text-link";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { isTemplateType } from "@/lib/templates/constants";

interface TemplatesPageProps {
  searchParams?: Promise<{ builderCreate?: string }>;
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const params = await searchParams;
  if (!getSupabasePublicEnv()) {
    return (
      <PageMain>
        <Heading>Templates</Heading>
        <Text muted className="mt-3">
          Configure Supabase env vars — see README.
        </Text>
      </PageMain>
    );
  }

  const gate = await requireUserWithOrg();
  if (!gate.ok) {
    return (
      <PageMain>
        <Heading>Templates</Heading>
        <Text muted className="mt-3">Supabase configuration is unavailable. Reload after applying env vars.</Text>
      </PageMain>
    );
  }

  const { session } = gate;
  const { data: rows, error } = await session.supabase
    .from("templates")
    .select("id,name,template_type,payload,updated_at")
    .eq("org_id", session.orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <PageMain>
        <Heading>Templates</Heading>
        <Text className="text-destructive mt-3 text-sm">
          Could not load templates ({error.message}). Apply{" "}
          <InlineCode>20250511160000_templates.sql</InlineCode> if you haven’t yet.
        </Text>
      </PageMain>
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
    <PageMain>
      <div className="text-sm leading-none">
        <TextLink href="/dashboard" variant="muted">
          Dashboard
        </TextLink>
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Heading>Templates</Heading>
          <Text muted className="mt-3 max-w-xl">
            Create builder templates visually, or use legacy letter templates with an in-browser PDF preview.
          </Text>
        </div>
        <CreateBuilderTemplateButton />
      </div>
      <CreateBuilderTemplateError show={params?.builderCreate === "failed"} />
      <div className="mt-10">
        <TemplatesPanel templates={templates} />
      </div>
    </PageMain>
  );
}

function CreateBuilderTemplateError({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <Text className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      Could not create a builder template. Please try again.
    </Text>
  );
}
