-- Org-scoped document templates JSON validated in app layer (see src/lib/templates/payload-schema.ts).

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  template_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint templates_template_type_chk check (template_type in ('blank', 'letter')),
  constraint templates_name_len check (char_length(trim(name)) between 1 and 120),
  constraint templates_org_name_uniq unique (org_id, name)
);

create index if not exists templates_org_created_desc_idx
  on public.templates (org_id, created_at desc);

alter table public.templates enable row level security;

create policy templates_select_member on public.templates
  for select using (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy templates_insert_member on public.templates
  for insert with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy templates_update_member on public.templates
  for update using (
    public.is_organization_member(org_id, (select auth.uid()))
  )
  with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy templates_delete_member on public.templates
  for delete using (
    public.is_organization_member(org_id, (select auth.uid()))
  );
