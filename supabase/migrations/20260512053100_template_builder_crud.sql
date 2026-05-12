-- Template builder storage: org-scoped JSON schemas with soft deletes.

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  page_size text not null default 'A4',
  orientation text not null default 'portrait',
  schema jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.templates
  add column if not exists description text,
  add column if not exists page_size text not null default 'A4',
  add column if not exists orientation text not null default 'portrait',
  add column if not exists schema jsonb not null default '{}'::jsonb,
  add column if not exists version integer not null default 1,
  add column if not exists deleted_at timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'templates'
      and column_name = 'template_type'
  ) then
    alter table public.templates alter column template_type drop not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'templates'
      and column_name = 'payload'
  ) then
    update public.templates
    set schema = coalesce(payload, '{}'::jsonb)
    where schema = '{}'::jsonb
      and payload is not null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'templates_page_size_chk'
  ) then
    alter table public.templates
      add constraint templates_page_size_chk check (page_size in ('A4', 'Letter', 'Legal'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'templates_orientation_chk'
  ) then
    alter table public.templates
      add constraint templates_orientation_chk check (orientation in ('portrait', 'landscape'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'templates_version_positive_chk'
  ) then
    alter table public.templates
      add constraint templates_version_positive_chk check (version >= 1);
  end if;
end $$;

create index if not exists templates_org_id_idx
  on public.templates (org_id);

create index if not exists templates_org_active_created_desc_idx
  on public.templates (org_id, created_at desc)
  where deleted_at is null;

alter table public.api_usage_logs
  drop constraint if exists api_usage_logs_method_chk,
  add constraint api_usage_logs_method_chk check (http_method in ('GET', 'POST', 'PATCH', 'DELETE'));

alter table public.templates enable row level security;

drop policy if exists templates_select_member on public.templates;
drop policy if exists templates_insert_member on public.templates;
drop policy if exists templates_update_member on public.templates;
drop policy if exists templates_delete_member on public.templates;

create policy templates_select_member on public.templates
  for select using (
    deleted_at is null
    and public.is_organization_member(org_id, (select auth.uid()))
  );

create policy templates_insert_member on public.templates
  for insert with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy templates_update_member on public.templates
  for update using (
    deleted_at is null
    and public.is_organization_member(org_id, (select auth.uid()))
  )
  with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy templates_delete_member on public.templates
  for delete using (
    public.is_organization_member(org_id, (select auth.uid()))
  );
