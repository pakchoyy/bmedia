create table if not exists game_plays (
  slug text primary key,
  plays int not null default 0,
  updated_at timestamptz not null default now()
);
