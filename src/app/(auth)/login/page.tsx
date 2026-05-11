import { Suspense } from "react";

import { Heading } from "@/components/ui/heading";
import { PageMain } from "@/components/ui/page-main";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <PageMain className="max-w-md">
      <Heading>Sign in</Heading>
      <Text muted className="mt-3">
        Use your work email — sessions respect your IdP policies.
      </Text>
      <Suspense
        fallback={
          <div className="mt-8 flex items-center gap-2 text-muted-foreground">
            <Spinner />
            <Text muted>Loading…</Text>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </PageMain>
  );
}
