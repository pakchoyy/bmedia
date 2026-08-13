-- ============================================================
-- BGY Interactive Learning — Admin Dashboard Migration
-- Jalankan di Supabase SQL Editor setelah schema dasar.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Kolom baru di tabel media
-- ------------------------------------------------------------
alter table media add column if not exists rejection_reason text;
alter table media add column if not exists updated_at timestamptz default now();

-- ------------------------------------------------------------
-- 2) Tabel profiles (role admin/user)
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

-- RLS: user bisa baca profilnya sendiri
create policy "user read own profile"
on profiles for select
using (auth.uid() = id);

-- RLS: admin bisa baca semua profil (helper untuk pengecekan role)
create policy "admin read all profiles"
on profiles for select
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- ------------------------------------------------------------
-- 3) Trigger updated_at
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
-- 4) RLS ADMIN untuk tabel media
--     (public read approved + public insert pending tetap ada di schema dasar)
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
-- 5) increment_plays → SECURITY DEFINER
--     Supaya RLS baru (admin-only UPDATE) tidak memblokir counter publik.
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
-- 6) Cara membuat admin pertama
--     1. Buat user di Supabase Auth (Authentication > Add user).
--     2. Jalankan:  update profiles set role = 'admin' where email = 'EMAIL_ADMIN';
-- ------------------------------------------------------------
