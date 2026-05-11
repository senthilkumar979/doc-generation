import { ChangePasswordForm } from '@/app/dashboard/password/ChangePasswordForm'
import { Heading } from '@/components/ui/heading'
import { PageMain } from '@/components/ui/page-main'
import { Text } from '@/components/ui/text'
import { requireUserWithOrg } from '@/lib/dashboard/require-user-org'
import { getSupabasePublicEnv } from '@/lib/supabase/env'

export default async function SettingsPasswordPage() {
  if (!getSupabasePublicEnv()) {
    return (
      <PageMain>
        <Heading>Change password</Heading>
        <Text muted className="mt-3">
          Configure Supabase environment variables — see README.
        </Text>
      </PageMain>
    )
  }

  const gate = await requireUserWithOrg()
  if (!gate.ok) {
    return (
      <PageMain>
        <Heading>Change password</Heading>
        <Text muted className="mt-3">
          Configuration unavailable.
        </Text>
      </PageMain>
    )
  }

  return (
    <PageMain>
      <Heading>Change password</Heading>
      <Text muted className="mt-3 max-w-xl">
        Set a new password for your account. Other sessions may require signing
        in again.
      </Text>
      <ChangePasswordForm />
    </PageMain>
  )
}
