# Supabase Schema — BGY Interactive Learning

**Project:** bgy-interactive  
**Database:** PostgreSQL (Supabase)

---

## Table: `media`

```sql
create table media (
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
```

## Row Level Security

```sql
-- Enable RLS
alter table media enable row level security;

-- Publik hanya bisa baca yang approved
create policy "public read approved"
on media for select
using (status = 'approved');

-- Publik bisa insert (form submit)
create policy "public insert"
on media for insert
with check (status = 'pending');
```

## Index

```sql
create index on media (status);
create index on media (category);
create index on media (jenjang);
create index on media (plays desc);
```

## Plays Counter (RPC)

```sql
create or replace function increment_plays(media_id uuid)
returns void as $$
  update media set plays = plays + 1 where id = media_id;
$$ language sql;
```

---

## Environment Variables (Next.js)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```
