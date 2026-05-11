-- Fix Storage RLS for org-brand-assets (direct membership EXISTS works reliably under Storage context).
-- Tighten bucket: 2 MiB limit, JPEG/PNG/SVG only (aligned with app).

update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/svg+xml']::text[]
where id = 'org-brand-assets';

drop policy if exists "org-brand-assets member insert" on storage.objects;

drop policy if exists "org-brand-assets member update" on storage.objects;

drop policy if exists "org-brand-assets member delete" on storage.objects;

create policy "org-brand-assets member insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'org-brand-assets'
    and (select auth.uid()) is not null
    and exists (
      select 1 from public.organization_members om
      where om.user_id = (select auth.uid())
        and om.org_id = split_part(trim(both '/' from name), '/', 1)::uuid
    )
  );

create policy "org-brand-assets member update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'org-brand-assets'
    and (select auth.uid()) is not null
    and exists (
      select 1 from public.organization_members om
      where om.user_id = (select auth.uid())
        and om.org_id = split_part(trim(both '/' from name), '/', 1)::uuid
    )
  )
  with check (
    bucket_id = 'org-brand-assets'
    and (select auth.uid()) is not null
    and exists (
      select 1 from public.organization_members om
      where om.user_id = (select auth.uid())
        and om.org_id = split_part(trim(both '/' from name), '/', 1)::uuid
    )
  );

create policy "org-brand-assets member delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'org-brand-assets'
    and (select auth.uid()) is not null
    and exists (
      select 1 from public.organization_members om
      where om.user_id = (select auth.uid())
        and om.org_id = split_part(trim(both '/' from name), '/', 1)::uuid
    )
  );
