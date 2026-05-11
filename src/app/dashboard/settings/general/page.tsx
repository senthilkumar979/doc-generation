import { Heading } from "@/components/ui/heading";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export default async function SettingsGeneralPage() {
  if (!getSupabasePublicEnv()) {
    return (
      <PageMain>
        <Heading>General</Heading>
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
        <Heading>General</Heading>
        <Text muted className="mt-3">Configuration unavailable.</Text>
      </PageMain>
    );
  }

  return (
    <PageMain>
      <Heading>General</Heading>
      <Text muted className="mt-3 max-w-xl">
        Organization defaults, regional preferences, and notification policies will appear here.
      </Text>
    </PageMain>
  );
}
