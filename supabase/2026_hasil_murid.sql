-- Hasil permainan murid per set soal (jalankan sekali di Neon SQL Editor)
create table if not exists play_results (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references question_sets(id) on delete cascade,
  player_name text not null,
  mode text not null,                 -- free | edu
  score integer not null default 0,
  caught integer not null default 0,
  quiz_right integer not null default 0,
  quiz_wrong integer not null default 0,
  duration_s integer not null default 0,
  q_stats jsonb not null default '{}'::jsonb,   -- {"0":[benar,salah], ...} per nomor soal
  created_at timestamptz not null default now()
);

create index if not exists play_results_set_idx on play_results (set_id, created_at desc);
