-- Server-side API usage (written from Next /api/v1 via service role). No RLS policies = deny for anon/auth JWT; service_role bypasses.

create table if not exists public.api_usage_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  api_key_id uuid references public.api_keys (id) on delete set null,
  route text not null,
  http_method text not null,
  status_code smallint not null,
  duration_ms integer,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint api_usage_logs_method_chk check (http_method in ('GET', 'POST')),
  constraint api_usage_logs_status_chk check (status_code between 100 and 599)
);

create index if not exists api_usage_logs_org_created_desc_idx
  on public.api_usage_logs (org_id, created_at desc);

create index if not exists api_keys_prefix_active_idx
  on public.api_keys (key_prefix) where revoked_at is null;

alter table public.api_usage_logs enable row level security;
