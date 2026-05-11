import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Create your account</h1>
      <SignupForm />
    </div>
  );
}
