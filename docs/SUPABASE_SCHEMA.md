# Supabase Schema — BGY Interactive Learning

**Project:** bgy-interactive  
**Database:** PostgreSQL (Supabase)

> Jalankan `supabase/schema.sql` untuk fresh install lengkap, atau
> `supabase/2025_admin_dashboard.sql` sebagai migration jika schema lama sudah ada.

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
  rejection_reason text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Table: `profiles` (admin role)

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);
```

Trigger `on_auth_user_created` otomatis membuat baris `profiles` (role `user`)
setiap user Supabase Auth baru dibuat.

## Row Level Security

### `media`

```sql
-- Publik hanya bisa baca yang approved
create policy "public read approved"
on media for select using (status = 'approved');

-- Publik bisa insert (form submit) dengan status pending
create policy "public insert"
on media for insert with check (status = 'pending');

-- Admin (via profiles) bisa SELECT semua
create policy "admin read all media"
on media for select
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Admin bisa UPDATE
create policy "admin update media"
on media for update
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Admin bisa DELETE
create policy "admin delete media"
on media for delete
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

> Publik TIDAK bisa UPDATE/DELETE. Admin tidak memakai `using (true)`.

### `profiles`

```sql
-- User baca profil sendiri
create policy "user read own profile"
on profiles for select using (auth.uid() = id);

-- Admin baca semua profil
create policy "admin read all profiles"
on profiles for select
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

Tidak ada policy INSERT/UPDATE/DELETE publik pada `profiles`.

## Index

```sql
create index on media (status);
create index on media (category);
create index on media (jenjang);
create index on media (plays desc);
```

## Trigger `updated_at`

```sql
create or replace function set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create trigger media_set_updated_at
before update on media for each row execute function set_updated_at();
```

## Plays Counter (RPC) — SECURITY DEFINER

```sql
create or replace function increment_plays(media_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update media set plays = plays + 1 where id = media_id;
$$;

grant execute on function increment_plays(uuid) to anon, authenticated;
```

`security definer` dipakai agar RLS admin (admin-only UPDATE) tidak memblokir
counter plays publik, tanpa memberi izin UPDATE umum ke anon.

## Membuat Admin Pertama

1. Buat user di Supabase Auth (Authentication > Add user / sign up).
2. Jalankan SQL:

```sql
update profiles set role = 'admin' where email = 'EMAIL_ADMIN';
```

---

## Environment Variables (Next.js)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

> Hanya anon key yang dipakai di client. Operasi admin berjalan lewat session
> Supabase Auth (authenticated) + RLS. Tidak ada service role key di frontend.
