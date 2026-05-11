-- Org-scoped API keys: secret shown once at creation; only a hash + short prefix persist.

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  key_prefix text not null,
  secret_hash text not null,
  secret_hash_alg text not null default 'sha256_v1' check (secret_hash_alg in ('sha256_v1')),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint api_keys_name_len check (char_length(trim(name)) between 1 and 80),
  constraint api_keys_prefix_len check (char_length(key_prefix) between 8 and 64),
  constraint api_keys_secret_hash_len check (char_length(secret_hash) = 64)
);

create index if not exists api_keys_org_id_created_at_desc_idx
  on public.api_keys (org_id, created_at desc);

alter table public.api_keys enable row level security;

create policy api_keys_select_member on public.api_keys
  for select using (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy api_keys_insert_member on public.api_keys
  for insert with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy api_keys_update_member on public.api_keys
  for update using (
    public.is_organization_member(org_id, (select auth.uid()))
  )
  with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );
