-- ============================================================================
-- Portfolio admin: database schema, Row Level Security, and storage policies
-- ----------------------------------------------------------------------------
-- Run this whole file once in the Supabase SQL Editor (Dashboard -> SQL Editor).
-- It is safe to re-run: it drops and recreates policies and uses
-- "if not exists" / "on conflict" where possible.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Administrators
-- ----------------------------------------------------------------------------
-- Only user ids present in this table can manage content. Nobody can add
-- themselves: there are no INSERT policies, so rows can only be added from the
-- Supabase dashboard / service role (i.e. by you).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Helper used by every policy below. SECURITY DEFINER lets it read the admins
-- table without triggering RLS recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

drop policy if exists "Admins can read admin list" on public.admins;
create policy "Admins can read admin list"
on public.admins for select
to authenticated
using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. updated_at trigger helper
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Certificates
-- ----------------------------------------------------------------------------
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text,
  date_received date,
  description text,
  category text,
  file_path text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists certificates_visibility_idx on public.certificates (visibility);
create index if not exists certificates_category_idx on public.certificates (category);
create index if not exists certificates_file_path_idx on public.certificates (file_path);

drop trigger if exists certificates_set_updated_at on public.certificates;
create trigger certificates_set_updated_at
before update on public.certificates
for each row execute function public.set_updated_at();

alter table public.certificates enable row level security;

-- Everyone can read public rows; the admin can read everything.
drop policy if exists "Read public certificates" on public.certificates;
create policy "Read public certificates"
on public.certificates for select
to anon, authenticated
using (visibility = 'public' or public.is_admin());

-- Only the admin can create / change / remove rows.
drop policy if exists "Admins insert certificates" on public.certificates;
create policy "Admins insert certificates"
on public.certificates for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins update certificates" on public.certificates;
create policy "Admins update certificates"
on public.certificates for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins delete certificates" on public.certificates;
create policy "Admins delete certificates"
on public.certificates for delete
to authenticated
using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. Games
-- ----------------------------------------------------------------------------
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  game_url text not null,
  platform text,
  genre text,
  development_status text,
  thumbnail_path text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_visibility_idx on public.games (visibility);
create index if not exists games_platform_idx on public.games (platform);
create index if not exists games_thumbnail_path_idx on public.games (thumbnail_path);

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
before update on public.games
for each row execute function public.set_updated_at();

alter table public.games enable row level security;

drop policy if exists "Read public games" on public.games;
create policy "Read public games"
on public.games for select
to anon, authenticated
using (visibility = 'public' or public.is_admin());

drop policy if exists "Admins insert games" on public.games;
create policy "Admins insert games"
on public.games for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins update games" on public.games;
create policy "Admins update games"
on public.games for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins delete games" on public.games;
create policy "Admins delete games"
on public.games for delete
to authenticated
using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. Storage buckets
-- ----------------------------------------------------------------------------
-- Both buckets are PRIVATE. Private files are never reachable by URL unless a
-- policy below allows it, and the app always hands out short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificate-files',
  'certificate-files',
  false,
  10485760, -- 10 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'game-thumbnails',
  'game-thumbnails',
  false,
  10485760, -- 10 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Certificate files: readable when a public certificate references the path,
-- or by the admin. Signed URLs can only be generated for objects the caller is
-- allowed to SELECT.
drop policy if exists "Read certificate files" on storage.objects;
create policy "Read certificate files"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'certificate-files'
  and (
    public.is_admin()
    or exists (
      select 1 from public.certificates c
      where c.file_path = storage.objects.name
        and c.visibility = 'public'
    )
  )
);

-- Game thumbnails: same rule, based on public games.
drop policy if exists "Read game thumbnails" on storage.objects;
create policy "Read game thumbnails"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'game-thumbnails'
  and (
    public.is_admin()
    or exists (
      select 1 from public.games g
      where g.thumbnail_path = storage.objects.name
        and g.visibility = 'public'
    )
  )
);

-- Uploads, replacements, and deletes: admin only.
drop policy if exists "Admins upload certificate files" on storage.objects;
create policy "Admins upload certificate files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'certificate-files' and public.is_admin());

drop policy if exists "Admins update certificate files" on storage.objects;
create policy "Admins update certificate files"
on storage.objects for update
to authenticated
using (bucket_id = 'certificate-files' and public.is_admin())
with check (bucket_id = 'certificate-files' and public.is_admin());

drop policy if exists "Admins delete certificate files" on storage.objects;
create policy "Admins delete certificate files"
on storage.objects for delete
to authenticated
using (bucket_id = 'certificate-files' and public.is_admin());

drop policy if exists "Admins upload game thumbnails" on storage.objects;
create policy "Admins upload game thumbnails"
on storage.objects for insert
to authenticated
with check (bucket_id = 'game-thumbnails' and public.is_admin());

drop policy if exists "Admins update game thumbnails" on storage.objects;
create policy "Admins update game thumbnails"
on storage.objects for update
to authenticated
using (bucket_id = 'game-thumbnails' and public.is_admin())
with check (bucket_id = 'game-thumbnails' and public.is_admin());

drop policy if exists "Admins delete game thumbnails" on storage.objects;
create policy "Admins delete game thumbnails"
on storage.objects for delete
to authenticated
using (bucket_id = 'game-thumbnails' and public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. Grants
-- ----------------------------------------------------------------------------
-- Supabase applies sensible default privileges, but these guarantee the API
-- roles can reach the tables. Row access is still fully governed by the RLS
-- policies above, so granting these does not weaken security.
grant usage on schema public to anon, authenticated;
grant select on public.certificates to anon, authenticated;
grant insert, update, delete on public.certificates to authenticated;
grant select on public.games to anon, authenticated;
grant insert, update, delete on public.games to authenticated;
grant select on public.admins to authenticated;
