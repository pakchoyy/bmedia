-- ============================================================
-- BGY — Tambah kolom crop thumbnail (zoom + geser vertikal)
-- Jalankan di Supabase SQL Editor. Aman dijalankan ulang.
-- ============================================================

alter table media
  add column if not exists thumbnail_pos_y double precision default 50;

alter table media
  add column if not exists thumbnail_zoom double precision default 1;
