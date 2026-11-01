insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'template-files',
    'template-files',
    false,
    26214400,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  ),
  (
    'template-previews',
    'template-previews',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins manage separated template assets" on storage.objects;
create policy "Admins manage separated template assets"
  on storage.objects for all to authenticated
  using (
    bucket_id in ('template-files', 'template-previews')
    and public.is_marketplace_admin()
  )
  with check (
    bucket_id in ('template-files', 'template-previews')
    and public.is_marketplace_admin()
  );

drop policy if exists "Anyone can read template previews" on storage.objects;
create policy "Anyone can read template previews"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'template-previews');

drop policy if exists "Customers read purchased template files" on storage.objects;
create policy "Customers read purchased template files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'template-files'
    and exists (
      select 1
      from public.templates
      join public.purchases on purchases.template_id = templates.id
      where templates.file_path = 'template-files:' || storage.objects.name
        and purchases.user_id = (select auth.uid())
        and purchases.status = 'paid'
    )
  );
