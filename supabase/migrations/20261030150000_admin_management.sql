alter table public.profiles
  add column if not exists is_active boolean not null default true;

create or replace function public.is_marketplace_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('admin', 'super_admin')
      and coalesce(is_active, true)
  );
$$;

create or replace function public.is_marketplace_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'super_admin'
      and coalesce(is_active, true)
  );
$$;

alter table public.templates
  add column if not exists is_featured boolean not null default false,
  add column if not exists file_path text,
  add column if not exists preview_image_path text;

alter table public.downloads
  add column if not exists download_type text not null default 'free'
    check (download_type in ('free', 'purchased'));

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 1 and 5000),
  is_published boolean not null default false,
  moderated_by uuid references public.profiles(id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, template_id)
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  subject text not null default 'general',
  message text not null check (char_length(message) between 1 and 10000),
  status text not null default 'new' check (status in ('new', 'handled')),
  handled_by uuid references public.profiles(id) on delete set null,
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.contact_messages
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists subject text not null default 'general',
  add column if not exists message text,
  add column if not exists status text not null default 'new',
  add column if not exists handled_by uuid references public.profiles(id) on delete set null,
  add column if not exists handled_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique check (char_length(content_key) between 1 and 160),
  section text not null check (char_length(section) between 1 and 80),
  content text not null default '',
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.reviews enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_content enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('reviews', 'contact_messages', 'site_content')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

drop policy if exists "Admins manage templates" on public.templates;
create policy "Admins manage templates"
  on public.templates for all to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
  on public.categories for all to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
  on public.profiles for select to authenticated
  using (public.is_marketplace_admin());

drop policy if exists "Super admins update profiles" on public.profiles;
create policy "Super admins update profiles"
  on public.profiles for update to authenticated
  using (public.is_marketplace_super_admin())
  with check (public.is_marketplace_super_admin());

drop policy if exists "Published reviews are readable" on public.reviews;
create policy "Published reviews are readable"
  on public.reviews for select to anon, authenticated
  using (is_published or user_id = (select auth.uid()) or public.is_marketplace_admin());

drop policy if exists "Customers create own reviews" on public.reviews;
create policy "Customers create own reviews"
  on public.reviews for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.purchases
      where purchases.user_id = (select auth.uid())
        and purchases.template_id = reviews.template_id
        and purchases.status = 'paid'
    )
  );

drop policy if exists "Admins moderate reviews" on public.reviews;
create policy "Admins moderate reviews"
  on public.reviews for all to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages"
  on public.contact_messages for insert to anon, authenticated
  with check (
    user_id is null or user_id = (select auth.uid())
  );

drop policy if exists "Admins manage contact messages" on public.contact_messages;
create policy "Admins manage contact messages"
  on public.contact_messages for all to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

drop policy if exists "Published site content is readable" on public.site_content;
create policy "Published site content is readable"
  on public.site_content for select to anon, authenticated
  using (true);

drop policy if exists "Admins manage site content" on public.site_content;
create policy "Admins manage site content"
  on public.site_content for all to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'template-assets',
  'template-assets',
  false,
  26214400,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins manage template assets" on storage.objects;
create policy "Admins manage template assets"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'template-assets'
    and public.is_marketplace_admin()
  )
  with check (
    bucket_id = 'template-assets'
    and public.is_marketplace_admin()
  );

grant select, insert, update, delete on public.reviews to authenticated;
grant select on public.reviews to anon;
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant select, insert, update, delete on public.site_content to authenticated;
grant select on public.site_content to anon;

drop policy if exists "Customers read assets for paid templates" on storage.objects;
create policy "Customers read assets for paid templates"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'template-assets'
    and exists (
      select 1
      from public.templates
      join public.purchases on purchases.template_id = templates.id
      where templates.file_path = storage.objects.name
        and purchases.user_id = (select auth.uid())
        and purchases.status = 'paid'
    )
  );

create or replace function public.prevent_non_admin_marketplace_content_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_marketplace_admin() then
    raise exception 'Only an active marketplace admin may change templates or categories';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_template_changes on public.templates;
create trigger protect_template_changes
  before insert or update or delete on public.templates
  for each row execute function public.prevent_non_admin_marketplace_content_changes();

drop trigger if exists protect_category_changes on public.categories;
create trigger protect_category_changes
  before insert or update or delete on public.categories
  for each row execute function public.prevent_non_admin_marketplace_content_changes();

create or replace function public.claim_free_template_download(p_template_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  used_count integer;
begin
  if current_user_id is null then
    raise exception 'Sign in is required to download templates';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = current_user_id and coalesce(is_active, true)
  ) then
    raise exception 'An active account is required to download templates';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));

  if not exists (
    select 1
    from public.templates
    where id = p_template_id
      and is_published
      and (is_free or coalesce(price, 0) = 0)
      and file_path is not null
  ) then
    raise exception 'This free template is unavailable';
  end if;

  if exists (
    select 1 from public.downloads
    where user_id = current_user_id
      and template_id = p_template_id
      and download_type = 'free'
  ) then
    insert into public.downloads (user_id, template_id, download_type, downloaded_at)
    values (current_user_id, p_template_id, 'free', now());
    return true;
  end if;

  select count(distinct template_id)::integer
    into used_count
    from public.downloads
    where user_id = current_user_id
      and download_type = 'free';

  if used_count >= 3 then
    raise exception 'The three free template downloads have been used';
  end if;

  insert into public.downloads (user_id, template_id, download_type, downloaded_at)
  values (current_user_id, p_template_id, 'free', now());

  return true;
end;
$$;

create or replace function public.record_paid_template_download(p_template_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Sign in is required to download templates';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = current_user_id and coalesce(is_active, true)
  ) then
    raise exception 'An active account is required to download templates';
  end if;

  if not exists (
    select 1 from public.purchases
    where user_id = current_user_id
      and template_id = p_template_id
      and status = 'paid'
  ) then
    raise exception 'A confirmed purchase is required to download this template';
  end if;

  if not exists (
    select 1 from public.templates
    where id = p_template_id and is_published and file_path is not null
  ) then
    raise exception 'The purchased template file is unavailable';
  end if;

  insert into public.downloads (user_id, template_id, download_type, downloaded_at)
  values (current_user_id, p_template_id, 'purchased', now());

  return true;
end;
$$;

create or replace function public.record_template_download(p_template_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  template_is_free boolean;
begin
  select (is_free or coalesce(price, 0) = 0)
    into template_is_free
    from public.templates
    where id = p_template_id
      and is_published;

  if not found then
    raise exception 'This published template is unavailable';
  end if;

  if template_is_free then
    perform public.claim_free_template_download(p_template_id);
  else
    perform public.record_paid_template_download(p_template_id);
  end if;

  return true;
end;
$$;

revoke all on function public.claim_free_template_download(uuid) from public;
grant execute on function public.claim_free_template_download(uuid) to authenticated;
revoke all on function public.record_paid_template_download(uuid) from public;
grant execute on function public.record_paid_template_download(uuid) to authenticated;
revoke all on function public.record_template_download(uuid) from public;
grant execute on function public.record_template_download(uuid) to authenticated;

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not public.is_marketplace_super_admin() then
    raise exception 'Only an active super admin may change account roles or status';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();
