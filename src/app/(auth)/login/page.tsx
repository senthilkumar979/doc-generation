import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sign in</h1>
      <Suspense fallback={<p className="mt-6 text-sm text-zinc-500">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
