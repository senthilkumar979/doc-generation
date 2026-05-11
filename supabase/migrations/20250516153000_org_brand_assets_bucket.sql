-- Public bucket for organization brand images (readable via public URL for templates/PDF).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'org-brand-assets',
  'org-brand-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can read (bucket is public; objects need SELECT for SQL clients).
drop policy if exists "org-brand-assets public read" on storage.objects;

create policy "org-brand-assets public read"
  on storage.objects for select to public using (bucket_id = 'org-brand-assets');

drop policy if exists "org-brand-assets member insert" on storage.objects;

create policy "org-brand-assets member insert"
  on storage.objects for insert to authenticated with check (
    bucket_id = 'org-brand-assets'
    and public.is_organization_member((split_part(name, '/', 1))::uuid, (select auth.uid()))
  );

drop policy if exists "org-brand-assets member update" on storage.objects;

create policy "org-brand-assets member update"
  on storage.objects for update to authenticated using (
    bucket_id = 'org-brand-assets'
    and public.is_organization_member((split_part(name, '/', 1))::uuid, (select auth.uid()))
  )
  with check (
    bucket_id = 'org-brand-assets'
    and public.is_organization_member((split_part(name, '/', 1))::uuid, (select auth.uid()))
  );

drop policy if exists "org-brand-assets member delete" on storage.objects;

create policy "org-brand-assets member delete"
  on storage.objects for delete to authenticated using (
    bucket_id = 'org-brand-assets'
    and public.is_organization_member((split_part(name, '/', 1))::uuid, (select auth.uid()))
  );
