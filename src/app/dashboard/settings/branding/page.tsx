import { BrandingSettingsPanel } from "@/components/dashboard/branding/branding-settings-panel";
import { Heading } from "@/components/ui/heading";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";
import type { OrgBrandAddressRow, OrgBrandImageRow, OrgBrandProfileRow } from "@/lib/branding/org-brand-schema";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export default async function SettingsBrandingPage() {
  if (!getSupabasePublicEnv()) {
    return (
      <PageMain>
        <Heading>Branding</Heading>
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
        <Heading>Branding</Heading>
        <Text muted className="mt-3">Configuration unavailable.</Text>
      </PageMain>
    );
  }

  const { data: profileData, error: profileError } = await gate.session.supabase
    .from("org_brand_profiles")
    .select("*")
    .eq("org_id", gate.session.orgId)
    .maybeSingle();

  if (profileError) {
    return (
      <PageMain>
        <Heading>Branding</Heading>
        <Text className="mt-3 text-destructive text-sm">Could not load branding profile ({profileError.message}).</Text>
      </PageMain>
    );
  }

  const { data: addressesData, error: addressesError } = await gate.session.supabase
    .from("org_brand_addresses")
    .select("*")
    .eq("org_id", gate.session.orgId)
    .order("created_at", { ascending: false });
  if (addressesError) {
    return (
      <PageMain>
        <Heading>Branding</Heading>
        <Text className="mt-3 text-destructive text-sm">Could not load addresses ({addressesError.message}).</Text>
      </PageMain>
    );
  }

  const { data: imagesData, error: imagesError } = await gate.session.supabase
    .from("org_brand_images")
    .select("*")
    .eq("org_id", gate.session.orgId)
    .order("created_at", { ascending: false });
  if (imagesError) {
    return (
      <PageMain>
        <Heading>Branding</Heading>
        <Text className="mt-3 text-destructive text-sm">Could not load images ({imagesError.message}).</Text>
      </PageMain>
    );
  }

  return (
    <PageMain>
      <Heading>Branding</Heading>
      <Text muted className="mt-3 max-w-xl">
        Manage logos, colors, company information, and address defaults used across generated documents.
      </Text>
      <BrandingSettingsPanel
        profile={(profileData as OrgBrandProfileRow | null) ?? null}
        addresses={(addressesData as OrgBrandAddressRow[] | null) ?? []}
        images={(imagesData as OrgBrandImageRow[] | null) ?? []}
      />
    </PageMain>
  );
}
