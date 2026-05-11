# Supabase setup (DocRail)

## 1. Create a project

Create a Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard). Note the **Project URL** and a **public** client key.

## 2. Keys: publishable (recommended) vs anon (legacy)

Supabase is moving from the legacy **anon** JWT to **publishable** keys (`sb_publishable_…`). DocRail supports **both**:

| Variable | When to use |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Preferred** — value from the dashboard **API Keys → Publishable** section. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Legacy** — JWT from **Legacy API Keys** if your project has not migrated yet. |

If **both** are set, the **publishable** key wins. The second argument to `createClient` is the same in either case; only the env name and key format differ.

Never put the **service_role** / secret key in `NEXT_PUBLIC_*` variables or browser code.

## 3. Local environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` **or** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; needed for `/api/v1` once you call the REST API)

## 4. Apply the database migrations

Open **SQL Editor** in the Supabase dashboard and run:

1. `supabase/migrations/20250511120000_init_auth_core.sql` — schema, RLS, and auth trigger (includes non-recursive org/member policies in current repo).

2. `supabase/migrations/20250511140000_fix_organization_rls_recursion.sql` — **only if** you previously applied an **older** copy of (1), or you still see RLS recursion on onboarding (`organizations` or `organization_members`). It defines `public.is_organization_member` as **`LANGUAGE plpgsql` SECURITY DEFINER** (simple `LANGUAGE sql` definitions can be **inlined** into policies so the membership scan runs as your user and RLS recurses). The function also disables `row_security` for that lookup. Then it recreates org/member policies (including `organizations_select_as_member` via the helper, not a subquery on `organization_members`).

3. `supabase/migrations/20250511153000_api_keys.sql` — org-scoped `api_keys` (hashed secret + prefix); RLS requires `public.is_organization_member`. Required for **Dashboard → API keys** (`/dashboard/api-keys`).

4. `supabase/migrations/20250511160000_templates.sql` — org-scoped `templates` (`blank` \| `letter` + JSON `payload`); RLS same as API keys. Required for **Dashboard → Templates** (`/dashboard/templates`).

5. `supabase/migrations/20250511170000_api_usage_logs.sql` — `api_usage_logs` plus an index on active `api_keys.key_prefix` (for `/api/v1` lookups via the service role). Rows are written from Next **server** code only.

Or use the Supabase CLI (`supabase db push`) after linking the project.

If Postgres rejects `execute function` in the auth trigger, replace it with `execute procedure public.handle_new_user()` for older versions.

## 5. REST API (`/api/v1`) and service role key

The public app uses the **publishable / anon** keys. Programmatic access uses **Dashboard → API keys**: send `Authorization: Bearer <full_plaintext_key>` to `/api/v1/...`.

Configure **`.env.local`** with:

- **`SUPABASE_SERVICE_ROLE_KEY`** — from **Project Settings → API** (keep server-only; never `NEXT_PUBLIC_*`).

Without it, `/api/v1` returns **503** and cannot verify keys or write usage logs.

## 6. Auth settings

For local development you may disable **email confirmations** under **Authentication → Providers → Email** so `signUp` returns a session immediately.

Keep confirmations enabled in production and rely on `/auth/callback` after the user clicks the email link.
