import { OnboardingForm } from "./OnboardingForm";

export default function OnboardingOrganizationPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Create your organization</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        You need an organization before using the DocRail dashboard.
      </p>
      <OnboardingForm />
    </div>
  );
}
