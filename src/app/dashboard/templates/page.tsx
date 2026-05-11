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

export default async function TemplatesPage() {
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
      <Heading className="mt-4">Templates</Heading>
      <Text muted className="mt-3 max-w-xl">
        Letter templates use validated fields and ship with an in-browser PDF preview (React-PDF).
      </Text>
      <div className="mt-10">
        <TemplatesPanel templates={templates} />
      </div>
    </PageMain>
  );
}
