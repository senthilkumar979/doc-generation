-- DocRail core: profiles, organizations, membership, RLS, auth sync trigger.
-- Apply in Supabase SQL editor or via: supabase db push (after linking project).

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy users_select_own on public.users
  for select using (id = (select auth.uid()));

create policy users_update_own on public.users
  for update using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete restrict,
  name text not null,
  plan text not null default 'free',
  branding jsonb not null default '{}'::jsonb,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  constraint organization_members_role_chk check (role in ('owner', 'admin', 'member')),
  constraint organization_members_org_user_uniq unique (org_id, user_id)
);

-- Membership lookup for RLS must not be LANGUAGE sql SECURITY DEFINER: Postgres can inline
-- simple SQL bodies into policies, so inner scans run as invoker → RLS recursion on organization_members.
create or replace function public.is_organization_member(p_org_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if p_org_id is null or p_user_id is null then
    return false;
  end if;
  perform set_config('row_security', 'off', true);
  return exists (
    select 1 from public.organization_members m
    where m.org_id = p_org_id and m.user_id = p_user_id
  );
end;
$$;

revoke all on function public.is_organization_member(uuid, uuid) from public;
grant execute on function public.is_organization_member(uuid, uuid) to authenticated;

alter table public.organizations enable row level security;

create policy organizations_select_as_owner on public.organizations
  for select using (owner_id = (select auth.uid()));

create policy organizations_select_as_member on public.organizations
  for select using (
    public.is_organization_member(id, (select auth.uid()))
  );

create policy organizations_insert_self_owner on public.organizations
  for insert with check (owner_id = (select auth.uid()));

create policy organizations_update_owner on public.organizations
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

alter table public.organization_members enable row level security;

create policy organization_members_select_self_or_shared_org on public.organization_members
  for select using (
    user_id = (select auth.uid())
    or public.is_organization_member(org_id, (select auth.uid()))
  );

create policy organization_members_insert_owner on public.organization_members
  for insert with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.organizations o
      where o.id = org_id
        and o.owner_id = (select auth.uid())
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
