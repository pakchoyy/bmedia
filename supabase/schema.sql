-- ============================================================
-- BGY Interactive Learning — Supabase Schema (lengkap, fresh install)
-- Jalankan di Supabase SQL Editor.
-- Catatan: migration terpisah ada di supabase/2025_admin_dashboard.sql
-- ============================================================

-- ------------------------------------------------------------
-- Tabel: media
-- ------------------------------------------------------------
create table if not exists media (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  mapel text not null,
  jenjang text not null check (jenjang in ('SD', 'SMP', 'SMA', 'SMK', 'Umum')),
  kelas text not null,
  category text not null check (category in ('Laboratorium Maya', 'Multimedia Interaktif', 'Game Edukasi', 'Quiz Interaktif', 'Modul Digital')),
  tool text not null,
  link_url text not null,
  thumbnail_url text,
  thumbnail_position double precision default 50,
  description text not null,
  guru_name text not null,
  sekolah text not null,
  guru_wa text not null,
  plays integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table media enable row level security;

-- Publik hanya bisa baca yang approved
create policy "public read approved"
on media for select
using (status = 'approved');

-- Publik bisa insert (form submit) dengan status pending
create policy "public insert"
on media for insert
with check (status = 'pending');

-- Index
create index if not exists media_status_idx on media (status);
create index if not exists media_category_idx on media (category);
create index if not exists media_jenjang_idx on media (jenjang);
create index if not exists media_plays_idx on media (plays desc);

-- ------------------------------------------------------------
-- Tabel: profiles (role admin/user)
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Auto-create profile saat user Supabase Auth baru dibuat
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS profiles: user baca profil sendiri; admin baca semua
create policy "user read own profile"
on profiles for select
using (auth.uid() = id);

create policy "admin read all profiles"
on profiles for select
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- ------------------------------------------------------------
-- RLS ADMIN untuk tabel media
-- ------------------------------------------------------------
create policy "admin read all media"
on media for select
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "admin update media"
on media for update
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "admin delete media"
on media for delete
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- ------------------------------------------------------------
-- Trigger updated_at
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists media_set_updated_at on media;
create trigger media_set_updated_at
before update on media
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Plays Counter (RPC) — SECURITY DEFINER agar anon bisa increment
-- tanpa diberi izin UPDATE umum pada tabel media.
-- ------------------------------------------------------------
create or replace function increment_plays(media_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update media set plays = plays + 1 where id = media_id;
$$;

grant execute on function increment_plays(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- Cara membuat admin pertama
--   1. Buat user di Supabase Auth (Authentication > Add user).
--   2. Jalankan:  update profiles set role = 'admin' where email = 'EMAIL_ADMIN';
-- ------------------------------------------------------------
