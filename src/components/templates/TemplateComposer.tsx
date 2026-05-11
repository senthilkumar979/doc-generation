"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createTemplateAction } from "@/actions/create-template";
import { TEMPLATE_TYPES } from "@/lib/templates/constants";

export function TemplateComposer() {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof TEMPLATE_TYPES)[number]>("letter");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setError(null);
    const fd = new FormData(form);
    const result = await createTemplateAction(undefined, fd);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">New template</h2>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Name
        <input
          name="name"
          type="text"
          required
          minLength={1}
          maxLength={120}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Type
        <select
          name="template_type"
          value={kind}
          onChange={(e) => setKind(e.target.value as (typeof TEMPLATE_TYPES)[number])}
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {TEMPLATE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "letter" ? "Letter (PDF preview)" : "Blank"}
            </option>
          ))}
        </select>
      </label>
      {kind === "letter" ? (
        <>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Subject
            <input
              name="subject"
              type="text"
              required
              minLength={1}
              maxLength={200}
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Body
            <textarea
              name="content"
              required
              minLength={1}
              maxLength={20000}
              rows={5}
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
        </>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Saving…" : "Create template"}
      </button>
    </form>
  );
}
