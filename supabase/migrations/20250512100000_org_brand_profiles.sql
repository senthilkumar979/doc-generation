-- One brand profile row per organization (logos, colors, address, etc.).

create table if not exists public.org_brand_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  company_name text,
  legal_name text,
  tagline text,
  website_url text,
  support_email text,
  primary_color text,
  secondary_color text,
  accent_color text,
  logo_url text,
  icon_url text,
  hero_image_url text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint org_brand_profiles_org_id_uniq unique (org_id)
);

create index if not exists org_brand_profiles_org_id_idx
  on public.org_brand_profiles (org_id);

alter table public.org_brand_profiles enable row level security;

create policy org_brand_profiles_select_member on public.org_brand_profiles
  for select using (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy org_brand_profiles_insert_member on public.org_brand_profiles
  for insert with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy org_brand_profiles_update_member on public.org_brand_profiles
  for update using (
    public.is_organization_member(org_id, (select auth.uid()))
  )
  with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy org_brand_profiles_delete_member on public.org_brand_profiles
  for delete using (
    public.is_organization_member(org_id, (select auth.uid()))
  );
