import { Heading } from "@/components/ui/heading";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";

import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <PageMain className="max-w-md">
      <Heading>Create your account</Heading>
      <Text muted className="mt-3">
        We’ll send a confirmation link if SSO email verification is enabled.
      </Text>
      <SignupForm />
    </PageMain>
  );
}
