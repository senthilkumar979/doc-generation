"use client";

import { useState } from "react";

import { createOrganizationAction } from "@/actions/create-organization";
import { isNextRedirectError } from "@/lib/next/is-next-redirect-error";

export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    try {
      const result = await createOrganizationAction(undefined, formData);
      if (result?.error) {
        setError(result.error);
        setPending(false);
      }
    } catch (err) {
      if (isNextRedirectError(err)) throw err;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Organization name
        <input
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
