import { Heading } from "@/components/ui/heading";
import { PageMain } from "@/components/ui/page-main";
import { Text } from "@/components/ui/text";

import { OnboardingForm } from "./OnboardingForm";

export default function OrganizationOnboardingPage() {
  return (
    <PageMain className="max-w-md">
      <Heading>Create your organization</Heading>
      <Text muted className="mt-3">
        This name appears on compliance exports and shared template libraries.
      </Text>
      <OnboardingForm />
    </PageMain>
  );
}
