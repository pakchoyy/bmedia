-- Mabar Online: ruang kelas real-time (polling). Jalankan sekali di Neon SQL Editor.
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                       -- 5 angka, dibagikan ke murid
  set_id uuid not null references question_sets(id) on delete cascade,
  teacher_id uuid not null references teachers(id) on delete cascade,
  status text not null default 'lobby',            -- lobby | playing | finished
  duration_s integer not null default 90,
  quiz_every integer not null default 3,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists rooms_teacher_idx on rooms (teacher_id, created_at desc);

create table if not exists room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  name text not null,
  token text not null,
  score integer not null default 0,
  caught integer not null default 0,
  quiz_right integer not null default 0,
  quiz_wrong integer not null default 0,
  finished boolean not null default false,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists room_players_name_idx on room_players (room_id, lower(name));
create index if not exists room_players_room_idx on room_players (room_id, score desc);
