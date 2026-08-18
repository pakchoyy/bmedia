-- ============================================================
-- BGY Interactive Learning — Tambah Kategori / Tipe Media
-- Jalankan di Supabase SQL Editor.
-- Menambah "Video Pembelajaran Interaktif" & "Lainnya"
-- ke constraint CHECK kolom media.category.
-- ============================================================

alter table media drop constraint if exists media_category_check;
alter table media add constraint media_category_check
check (category in (
  'Laboratorium Maya',
  'Multimedia Interaktif',
  'Game Edukasi',
  'Quiz Interaktif',
  'Modul Digital',
  'Video Pembelajaran Interaktif',
  'Lainnya'
));