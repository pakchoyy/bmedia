-- ============================================================
-- BGY — Statistik prompt game (halaman /buat)
-- Jalankan di Supabase SQL Editor. Aman dijalankan ulang.
-- ============================================================

create table if not exists public.buat_prompt_stats (
  id integer primary key check (id = 1),
  prompt_count bigint not null default 0,
  feedback_up bigint not null default 0,
  feedback_down bigint not null default 0,
  updated_at timestamptz default now()
);

insert into public.buat_prompt_stats (id, prompt_count, feedback_up, feedback_down)
values (1, 0, 0, 0)
on conflict (id) do nothing;

-- RPC untuk menambah counter (aman untuk public, tanpa update RLS manual)
create or replace function public.bgy_buat_track(
  p_prompt bigint default 0,
  p_up bigint default 0,
  p_down bigint default 0
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.buat_prompt_stats (id, prompt_count, feedback_up, feedback_down)
  values (1, p_prompt, p_up, p_down)
  on conflict (id) do update
    set prompt_count = buat_prompt_stats.prompt_count + excluded.prompt_count,
        feedback_up   = buat_prompt_stats.feedback_up   + excluded.feedback_up,
        feedback_down = buat_prompt_stats.feedback_down + excluded.feedback_down,
        updated_at    = now();
$$;

-- RLS: tabel boleh dibaca publik, RPC boleh dieksekusi publik
alter table public.buat_prompt_stats enable row level security;

drop policy if exists "buat_stats public read" on public.buat_prompt_stats;
create policy "buat_stats public read"
  on public.buat_prompt_stats for select
  using (true);

revoke all on function public.bgy_buat_track from public;
grant execute on function public.bgy_buat_track to anon, authenticated;
