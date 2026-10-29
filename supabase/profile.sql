-- ============================================================================
-- Personal website: profile table + profile photo storage
-- ----------------------------------------------------------------------------
-- Run this whole file once in the Supabase SQL Editor (Dashboard -> SQL Editor),
-- AFTER supabase/schema.sql. It is safe to re-run.
--
-- What this gives you:
--   * public.profile — a single row (id = 1) with your display name, tagline,
--     bio, and photo path. Everyone can read it; only you (admin) can change it.
--   * storage bucket "profile-photos" (private) for your profile picture.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Profile table (exactly one row, id = 1)
-- ----------------------------------------------------------------------------
create table if not exists public.profile (
  id integer primary key check (id = 1),
  display_name text not null default 'Delmart B. Asensi',
  tagline text not null default 'BSIT Student · Web Developer · Gamer',
  bio text not null default '',
  avatar_path text,
  updated_at timestamptz not null default now()
);

drop trigger if exists profile_set_updated_at on public.profile;
create trigger profile_set_updated_at
before update on public.profile
for each row execute function public.set_updated_at();

alter table public.profile enable row level security;

-- Everyone (including guests) can read the profile.
drop policy if exists "Read profile" on public.profile;
create policy "Read profile"
on public.profile for select
to anon, authenticated
using (true);

-- Only the admin can create / change it.
drop policy if exists "Admins insert profile" on public.profile;
create policy "Admins insert profile"
on public.profile for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins update profile" on public.profile;
create policy "Admins update profile"
on public.profile for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Seed the single row if it does not exist yet.
insert into public.profile (id, display_name, tagline, bio)
values (
  1,
  'Delmart B. Asensi',
  'BSIT Student · Web Developer · Gamer',
  'Third-year Information Technology student at Assumption College of Davao. I enjoy building clean, modern websites and tinkering with games in my free time.'
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 2. Profile photo bucket (private, 5 MB, images only)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  false,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Guests can view the photo that the profile row points at; the admin can
-- view any photo in the bucket. Signed URLs are generated through these rules.
drop policy if exists "Read profile photos" on storage.objects;
create policy "Read profile photos"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'profile-photos'
  and (
    public.is_admin()
    or exists (
      select 1 from public.profile p
      where p.avatar_path = storage.objects.name
    )
  )
);

-- Uploads, replacements, and deletes: admin only.
drop policy if exists "Admins upload profile photos" on storage.objects;
create policy "Admins upload profile photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'profile-photos' and public.is_admin());

drop policy if exists "Admins update profile photos" on storage.objects;
create policy "Admins update profile photos"
on storage.objects for update
to authenticated
using (bucket_id = 'profile-photos' and public.is_admin())
with check (bucket_id = 'profile-photos' and public.is_admin());

drop policy if exists "Admins delete profile photos" on storage.objects;
create policy "Admins delete profile photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'profile-photos' and public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. Grants (RLS policies above still govern every row)
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profile to anon, authenticated;
grant insert, update on public.profile to authenticated;
