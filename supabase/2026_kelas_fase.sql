-- ============================================================
-- BGY Interactive Learning — Kelas → Fase (Kurikulum Merdeka)
-- Jalankan di Supabase SQL Editor untuk memetakan data lama
-- ke fase. Menyesuaikan UI yang kini memakai Fase A–F.
-- TK/PAUD & "Umum / Semua Kelas" dibiarkan.
-- ============================================================

update media set kelas = 'Fase A (Kelas 1-2)'  where kelas in ('Kelas 1', 'Kelas 2');
update media set kelas = 'Fase B (Kelas 3-4)'  where kelas in ('Kelas 3', 'Kelas 4');
update media set kelas = 'Fase C (Kelas 5-6)'  where kelas in ('Kelas 5', 'Kelas 6');
update media set kelas = 'Fase D (Kelas 7-9)'  where kelas in ('Kelas 7', 'Kelas 8', 'Kelas 9');
update media set kelas = 'Fase E (Kelas 10)'   where kelas = 'Kelas 10';
update media set kelas = 'Fase F (Kelas 11-12)' where kelas in ('Kelas 11', 'Kelas 12');