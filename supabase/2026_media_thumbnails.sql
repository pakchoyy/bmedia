-- ============================================================
-- BGY Interactive Learning — Storage Thumbnail Migration
-- Jalankan di Supabase SQL Editor setelah schema dasar.
-- Membuat bucket untuk thumbnail upload + RLS storage.
-- Kolom media.thumbnail_url sudah ada di schema dasar.
-- Counter click/play sudah tersedia di kolom media.plays.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Bucket thumbnail (public read, upload oleh semua, admin utk delete)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'thumbnails',
  'thumbnails',
  true,
  1572864, -- 1.5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = 1572864,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- ------------------------------------------------------------
-- 2) RLS storage.objects
--    - Bulat: siapa pun boleh upload thumbnail (guru via form submit,
--      admin via tambah/edit). Bucket ini hanya untuk gambar kecil.
--    - Hapus/ubah (update) hanya admin.
-- ------------------------------------------------------------
drop policy if exists "public insert thumbnails" on storage.objects;
create policy "public insert thumbnails"
on storage.objects for insert
with check (
  bucket_id = 'thumbnails'
);

create policy "admin delete thumbnails"
on storage.objects for delete
using (
  bucket_id = 'thumbnails'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "admin update thumbnails"
on storage.objects for update
using (
  bucket_id = 'thumbnails'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  bucket_id = 'thumbnails'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- ------------------------------------------------------------
-- 3) RLS media.INSERT untuk admin
--    Policy publik hanya mengizinkan status='pending'.
--    Admin perlu izin insert agar bisa membuat media langsung
--    dengan status 'approved' (fitur "Tambah Media").
-- ------------------------------------------------------------
create policy "admin insert media"
on media for insert
with check (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- ------------------------------------------------------------
-- Catatan: URL publik file adalah
--   {NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thumbnails/{name}
-- ------------------------------------------------------------