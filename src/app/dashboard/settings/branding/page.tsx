import { BrandingSettingsPanel } from "@/components/dashboard/branding/branding-settings-panel";
import { Heading } from "@/components/ui/heading";
import { PageMain } from "@/components/ui/page-main";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import type { OrgBrandAddressRow, OrgBrandImageRow, OrgBrandProfileRow } from "@/lib/branding/org-brand-schema";
import { requireUserWithOrg } from "@/lib/dashboard/require-user-org";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export default async function SettingsBrandingPage() {
  if (!getSupabasePublicEnv()) {
    return (
      <PageMain className="max-w-6xl px-4 py-12 sm:py-16 lg:px-8">
        <Heading>Branding</Heading>
        <Text muted className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed">
          Configure Supabase environment variables — see README.
        </Text>
      </PageMain>
    );
  }

  const gate = await requireUserWithOrg();
  if (!gate.ok) {
    return (
      <PageMain className="max-w-6xl px-4 py-12 sm:py-16 lg:px-8">
        <Heading>Branding</Heading>
        <Text muted className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed">
          Configuration unavailable.
        </Text>
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
      <PageMain className="max-w-6xl px-4 py-12 sm:py-16 lg:px-8">
        <Heading>Branding</Heading>
        <Text className="mt-3 text-sm text-destructive">Could not load branding profile ({profileError.message}).</Text>
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
      <PageMain className="max-w-6xl px-4 py-12 sm:py-16 lg:px-8">
        <Heading>Branding</Heading>
        <Text className="mt-3 text-sm text-destructive">Could not load addresses ({addressesError.message}).</Text>
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
      <PageMain className="max-w-6xl px-4 py-12 sm:py-16 lg:px-8">
        <Heading>Branding</Heading>
        <Text className="mt-3 text-sm text-destructive">Could not load images ({imagesError.message}).</Text>
      </PageMain>
    );
  }

  return (
    <PageMain className="max-w-6xl px-4 py-12 sm:py-16 lg:px-8">
      <div className="space-y-4">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-primary/90">Settings</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Heading className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-[2rem]">
            Branding
          </Heading>
        </div>
        <Text muted className="max-w-2xl text-[0.9375rem] leading-relaxed">
          Curate how your organization reads and looks on every template, export, and customer-facing document.
        </Text>
        <Separator className="mt-6 max-w-xl bg-border/80" />
      </div>
      <BrandingSettingsPanel
        profile={(profileData as OrgBrandProfileRow | null) ?? null}
        addresses={(addressesData as OrgBrandAddressRow[] | null) ?? []}
        images={(imagesData as OrgBrandImageRow[] | null) ?? []}
      />
    </PageMain>
  );
}
