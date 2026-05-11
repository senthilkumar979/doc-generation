import { ApiKeysPanel } from "@/components/dashboard/ApiKeysPanel";
import type { ApiKeyListItem } from "@/components/dashboard/api-key-types";
import { Heading } from "@/components/ui/heading";
import { InlineCode } from "@/components/ui/inline-code";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";
import { TextLink } from "@/components/ui/text-link";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export default async function ApiKeysPage() {
  if (!getSupabasePublicEnv()) {
    return (
      <PageMain>
        <Heading>API keys</Heading>
        <Text muted className="mt-3">
          Add Supabase environment variables — see README.
        </Text>
      </PageMain>
    );
  }

  const gate = await requireUserWithOrg();
  if (!gate.ok) {
    return (
      <PageMain>
        <Heading>API keys</Heading>
        <Text muted className="mt-3">
          Supabase configuration is unavailable. Reload after applying env vars.
        </Text>
      </PageMain>
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
      <PageMain>
        <Heading>API keys</Heading>
        <Text className="text-destructive mt-3 text-sm">
          Could not load keys ({error.message}). If you haven’t run the latest Supabase migration, apply{" "}
          <InlineCode>20250511153000_api_keys.sql</InlineCode>.
        </Text>
      </PageMain>
    );
  }

  const keys = (rows ?? []) as ApiKeyListItem[];

  return (
    <PageMain>
      <div className="text-sm leading-none">
        <TextLink href="/dashboard" variant="muted">
          Dashboard
        </TextLink>
      </div>
      <Heading className="mt-4">API keys</Heading>
      <Text muted className="mt-3 max-w-xl">
        Secrets are hashed in the database. You only see the full value once after creation.
      </Text>
      <div className="mt-10">
        <ApiKeysPanel keys={keys} />
      </div>
    </PageMain>
  );
}
