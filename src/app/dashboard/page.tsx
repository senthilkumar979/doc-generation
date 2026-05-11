import { Heading } from "@/components/ui/heading";
import { InlineCode } from "@/components/ui/inline-code";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";
import { TextLink } from "@/components/ui/text-link";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export default async function DashboardPage() {
  if (!getSupabasePublicEnv()) {
    return (
      <PageMain>
        <Heading>Dashboard</Heading>
        <Text muted className="mt-3 leading-relaxed">
          Add <InlineCode>NEXT_PUBLIC_SUPABASE_URL</InlineCode> and either{" "}
          <InlineCode>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</InlineCode> (recommended) or{" "}
          <InlineCode>NEXT_PUBLIC_SUPABASE_ANON_KEY</InlineCode> to <InlineCode>.env.local</InlineCode>.
        </Text>
      </PageMain>
    );
  }

  const gate = await requireUserWithOrg();
  if (!gate.ok) {
    return (
      <PageMain>
        <Heading>Dashboard</Heading>
        <Text muted className="mt-3">
          Supabase client configuration is unavailable. Reload after setting env vars — see README.
        </Text>
      </PageMain>
    );
  }

  const { user } = gate.session;

  return (
    <PageMain>
      <Heading>Dashboard</Heading>
      <Text muted className="mt-3">
        Signed in as <span className="font-medium text-foreground">{user.email}</span>
      </Text>
      <ul className="mt-10 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <li>
          <TextLink href="/dashboard/api-keys">API keys</TextLink>
          <span> — create and revoke keys for the render API.</span>
        </li>
        <li>
          <TextLink href="/dashboard/templates">Templates</TextLink>
          <span> — blank or letter payloads with PDF preview.</span>
        </li>
      </ul>
      <Text muted className="mt-8 border-t border-border pt-8 text-xs leading-relaxed">
        Next: Trigger.dev-backed PDF renders for <InlineCode>/api/v1/documents/render</InlineCode>, then Stripe limits.
      </Text>
    </PageMain>
  );
}
