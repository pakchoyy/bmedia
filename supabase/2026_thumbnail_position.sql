-- ============================================================
-- BGY Interactive Learning — Thumbnail Position Migration
-- Jalankan di Supabase SQL Editor setelah 2026_media_thumbnails.sql.
-- Menambah kolom posisi horizontal thumbnail (0 = kiri, 50 = tengah, 100 = kanan)
-- ============================================================

alter table media add column if not exists thumbnail_position double precision default 50;