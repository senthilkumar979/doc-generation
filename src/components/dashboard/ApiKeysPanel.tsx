"use client";

import { useState } from "react";

import { createApiKeyAction, type CreateApiKeyResult } from "@/actions/create-api-key";
import { revokeApiKeyAction } from "@/actions/revoke-api-key";

export interface ApiKeyListItem {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  revoked_at: string | null;
}

interface ApiKeysPanelProps {
  keys: ApiKeyListItem[];
}

export function ApiKeysPanel({ keys }: ApiKeysPanelProps) {
  const [createError, setCreateError] = useState<string | null>(null);
  const [createPending, setCreatePending] = useState(false);
  const [revealed, setRevealed] = useState<CreateApiKeyResult["revealed"]>(undefined);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [revokePending, setRevokePending] = useState<string | null>(null);

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setCreatePending(true);
    setCreateError(null);
    const formData = new FormData(form);
    const result = await createApiKeyAction(undefined, formData);
    setCreatePending(false);
    if (result.error) {
      setCreateError(result.error);
      return;
    }
    if (result.revealed) {
      setRevealed(result.revealed);
      form.reset();
    }
  }

  async function onRevoke(id: string) {
    setRevokePending(id);
    setRevokeError(null);
    const fd = new FormData();
    fd.set("id", id);
    const result = await revokeApiKeyAction(undefined, fd);
    setRevokePending(null);
    if (result.error) setRevokeError(result.error);
  }

  return (
    <div className="space-y-8">
      {revealed ? (
        <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">Copy this secret now</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-200/90">
            It won’t be shown again. Key: <span className="font-semibold">{revealed.name}</span>
          </p>
          <code className="mt-3 block overflow-x-auto rounded bg-white/80 px-2 py-2 text-xs dark:bg-zinc-900">
            {revealed.plaintext}
          </code>
          <button
            type="button"
            className="mt-3 rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            onClick={() => setRevealed(undefined)}
          >
            I’ve saved it
          </button>
        </div>
      ) : null}

      <form onSubmit={onCreate} className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Create key</h2>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Label
          <input
            name="name"
            type="text"
            required
            minLength={1}
            maxLength={80}
            placeholder="Production PDFs"
            className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        {createError ? <p className="text-sm text-red-600">{createError}</p> : null}
        <button
          type="submit"
          disabled={createPending}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {createPending ? "Creating…" : "Generate API key"}
        </button>
      </form>

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Your keys</h2>
        {revokeError ? <p className="mt-2 text-sm text-red-600">{revokeError}</p> : null}
        {keys.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No API keys yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
            {keys.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{k.name}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-mono">{k.key_prefix}…</span>
                    {" · "}
                    {new Date(k.created_at).toLocaleString()}
                    {k.revoked_at ? " · revoked" : ""}
                  </p>
                </div>
                {k.revoked_at ? (
                  <span className="text-xs text-zinc-500">Revoked</span>
                ) : (
                  <button
                    type="button"
                    disabled={revokePending === k.id}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    onClick={() => void onRevoke(k.id)}
                  >
                    {revokePending === k.id ? "Revoking…" : "Revoke"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
