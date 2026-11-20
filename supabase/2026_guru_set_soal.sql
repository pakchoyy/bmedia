-- Akun guru & Set Soal (jalankan sekali di Neon SQL Editor)
create extension if not exists pgcrypto;

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,          -- disimpan huruf kecil
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists question_sets (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  title text not null,
  subject text,
  grade text,
  questions jsonb not null default '[]'::jsonb,  -- [{q, o:[4], a:0-3}]
  code text not null unique,                     -- kode kelas 6 karakter
  game text not null default 'kupu-kupu',
  plays integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists question_sets_teacher_idx on question_sets (teacher_id, updated_at desc);
