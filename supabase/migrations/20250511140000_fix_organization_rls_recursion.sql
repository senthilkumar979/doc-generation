-- Repair RLS recursion on organizations / organization_members.
--
-- Root causes addressed:
-- 1) LANGUAGE sql SECURITY DEFINER helpers can be inlined into policy checks; inlined
--    scans run as the invoker so RLS reapplies → infinite recursion on organization_members.
-- 2) organizations SELECT must not use a raw subquery on organization_members (same RLS churn).
--
-- Safe to re-run after prior versions of this migration.

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

drop policy if exists organizations_select_visible on public.organizations;
drop policy if exists organizations_select_as_owner on public.organizations;
drop policy if exists organizations_select_as_member on public.organizations;

create policy organizations_select_as_owner on public.organizations
  for select using (owner_id = (select auth.uid()));

create policy organizations_select_as_member on public.organizations
  for select using (
    public.is_organization_member(id, (select auth.uid()))
  );

drop policy if exists organization_members_select_visible on public.organization_members;
drop policy if exists organization_members_select_self_or_shared_org on public.organization_members;

create policy organization_members_select_self_or_shared_org on public.organization_members
  for select using (
    user_id = (select auth.uid())
    or public.is_organization_member(org_id, (select auth.uid()))
  );
