-- =============================================
-- BGY Interactive Learning — Supabase Schema
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Table: media
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
  description text not null,
  guru_name text not null,
  sekolah text not null,
  guru_wa text not null,
  plays integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz default now()
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

-- Plays Counter (RPC)
create or replace function increment_plays(media_id uuid)
returns void as $$
  update media set plays = plays + 1 where id = media_id;
$$ language sql;

-- Seed contoh data (opsional) — jalankan jika ingin data demo
-- insert into media (title, mapel, jenjang, kelas, category, tool, link_url, thumbnail_url, description, guru_name, sekolah, guru_wa, plays, status) values
-- ('Petualangan Pecahan', 'Matematika', 'SD', 'Kelas 4-6', 'Game Edukasi', 'Scratch', 'https://scratch.mit.edu/projects/123', null, 'Media interaktif untuk memahami konsep pecahan dasar melalui pengumpulan koin dan pemecahan rintangan.', 'Budi Santoso, S.Pd', 'SDN 1 Nusantara', '081234567890', 1200, 'approved');
