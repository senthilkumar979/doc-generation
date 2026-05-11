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

## 4. Apply the database migrations

Open **SQL Editor** in the Supabase dashboard and run:

1. `supabase/migrations/20250511120000_init_auth_core.sql` — schema, RLS, and auth trigger (includes non-recursive org/member policies in current repo).

2. `supabase/migrations/20250511140000_fix_organization_rls_recursion.sql` — **only if** you previously applied an **older** copy of (1), or you still see RLS recursion on onboarding (`organizations` or `organization_members`). It defines `public.is_organization_member` as **`LANGUAGE plpgsql` SECURITY DEFINER** (simple `LANGUAGE sql` definitions can be **inlined** into policies so the membership scan runs as your user and RLS recurses). The function also disables `row_security` for that lookup. Then it recreates org/member policies (including `organizations_select_as_member` via the helper, not a subquery on `organization_members`).

3. `supabase/migrations/20250511153000_api_keys.sql` — org-scoped `api_keys` (hashed secret + prefix); RLS requires `public.is_organization_member`. Required for **Dashboard → API keys** (`/dashboard/api-keys`).

Or use the Supabase CLI (`supabase db push`) after linking the project.

If Postgres rejects `execute function` in the auth trigger, replace it with `execute procedure public.handle_new_user()` for older versions.

## 5. Auth settings

For local development you may disable **email confirmations** under **Authentication → Providers → Email** so `signUp` returns a session immediately.

Keep confirmations enabled in production and rely on `/auth/callback` after the user clicks the email link.
