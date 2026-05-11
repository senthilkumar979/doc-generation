-- Normalize branding: move addresses and non-logo/icon images to dedicated tables.

alter table if exists public.org_brand_profiles
  drop column if exists hero_image_url,
  drop column if exists address_line1,
  drop column if exists address_line2,
  drop column if exists city,
  drop column if exists region,
  drop column if exists postal_code,
  drop column if exists country;

create table if not exists public.org_brand_addresses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  label text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists org_brand_addresses_org_id_created_idx
  on public.org_brand_addresses (org_id, created_at desc);

create unique index if not exists org_brand_addresses_primary_uniq
  on public.org_brand_addresses (org_id)
  where is_primary = true;

alter table public.org_brand_addresses enable row level security;

create policy org_brand_addresses_select_member on public.org_brand_addresses
  for select using (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy org_brand_addresses_insert_member on public.org_brand_addresses
  for insert with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy org_brand_addresses_update_member on public.org_brand_addresses
  for update using (
    public.is_organization_member(org_id, (select auth.uid()))
  )
  with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy org_brand_addresses_delete_member on public.org_brand_addresses
  for delete using (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create table if not exists public.org_brand_images (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  label text,
  image_type text not null default 'general',
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint org_brand_images_image_type_chk check (image_type in ('hero', 'banner', 'cover', 'general'))
);

create index if not exists org_brand_images_org_id_created_idx
  on public.org_brand_images (org_id, created_at desc);

alter table public.org_brand_images enable row level security;

create policy org_brand_images_select_member on public.org_brand_images
  for select using (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy org_brand_images_insert_member on public.org_brand_images
  for insert with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy org_brand_images_update_member on public.org_brand_images
  for update using (
    public.is_organization_member(org_id, (select auth.uid()))
  )
  with check (
    public.is_organization_member(org_id, (select auth.uid()))
  );

create policy org_brand_images_delete_member on public.org_brand_images
  for delete using (
    public.is_organization_member(org_id, (select auth.uid()))
  );
