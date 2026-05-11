import { Heading } from "@/components/ui/heading";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getProfileDisplayName } from "@/lib/dashboard/profile-display-name";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export default async function ProfilePage() {
  if (!getSupabasePublicEnv()) {
    return (
      <PageMain>
        <Heading>Profile</Heading>
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
        <Heading>Profile</Heading>
        <Text muted className="mt-3">Configuration unavailable.</Text>
      </PageMain>
    );
  }

  const { user } = gate.session;
  const display = getProfileDisplayName(user);
  const fullName =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : "—";

  return (
    <PageMain>
      <Heading>Profile</Heading>
      <Text muted className="mt-3 max-w-xl">
        Identity details from your DocRail session.
      </Text>
      <dl className="mt-10 max-w-md space-y-4 text-sm">
        <div className="border-b border-border pb-3">
          <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Display name</dt>
          <dd className="mt-1 font-medium text-foreground">{display}</dd>
        </div>
        <div className="border-b border-border pb-3">
          <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Full name</dt>
          <dd className="mt-1 text-foreground">{fullName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Email</dt>
          <dd className="mt-1 font-mono text-foreground text-xs">{user.email ?? "—"}</dd>
        </div>
      </dl>
    </PageMain>
  );
}
