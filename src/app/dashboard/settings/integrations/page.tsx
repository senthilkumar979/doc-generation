import { Heading } from "@/components/ui/heading";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export default async function SettingsIntegrationsPage() {
  if (!getSupabasePublicEnv()) {
    return (
      <PageMain>
        <Heading>Integrations</Heading>
        <Text muted className="mt-3">
          Configure Supabase environment variables — see README.
        </Text>
      </PageMain>
    );
  }

  const gate = await requireUserWithOrg();
  if (!gate.ok) {
    return (
      <PageMain>
        <Heading>Integrations</Heading>
        <Text muted className="mt-3">Configuration unavailable.</Text>
      </PageMain>
    );
  }

  return (
    <PageMain>
      <Heading>Integrations</Heading>
      <Text muted className="mt-3 max-w-xl">
        Connect webhooks, IdP directories, and delivery channels. Coming soon.
      </Text>
    </PageMain>
  );
}
