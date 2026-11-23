create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
create table if not exists usulan (
  id uuid primary key default gen_random_uuid(),
  nama text not null default '',
  kontak text not null default '',
  jenis text not null default 'Usulan game',
  pesan text not null,
  dibaca boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists usulan_created_idx on usulan (created_at desc);
alter table media add column if not exists approved_at timestamptz;
