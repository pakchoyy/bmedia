# OpenCode Prompt — BGY Interactive Learning

## Konteks
Kamu membangun **BGY Interactive Learning**, platform berbagi media pembelajaran interaktif untuk guru Indonesia. Bagian dari ekosistem **Bantu Guru Yuk (BGY)** di `bantuguruyuk.web.id`.

Baca semua dokumen berikut sebelum mulai coding:
- `PRD.md` — fitur lengkap dan scope
- `SUPABASE_SCHEMA.md` — SQL schema, RLS, RPC
- `TECH_STACK.md` — stack, struktur folder, warna
- `design-mockup.html` — **design reference utama**, implementasikan ulang dalam Tailwind

---

## Instruksi Utama

### Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase sebagai backend
- Deploy ke Vercel

### Setup Supabase
1. Install: `npm install @supabase/supabase-js @supabase/ssr`
2. Jalankan SQL di `SUPABASE_SCHEMA.md` di Supabase SQL Editor
3. Buat `lib/supabase.ts` untuk client init

### Design
- Ikuti **100% design dari `design-mockup.html`**
- Terjemahkan ke Tailwind CSS
- Tambahkan color palette BGY ke `tailwind.config.ts`

### Data
- Fetch media: `select * from media where status = 'approved'`
- Fetch di server component, filter/search/sort di client-side
- Trending: order by `plays desc`, limit 5

### Form Submit
- Insert ke tabel `media` dengan `status: 'pending'` dan `plays: 0` (default)
- Form publik, tanpa auth
- Tampilkan pesan sukses setelah submit

### Plays Counter
- Panggil Supabase RPC `increment_plays(media_id)` setiap klik "Buka Media"
- Bisa dipanggil langsung dari client (anon key cukup karena RPC tidak butuh auth)

---

## Urutan Build

1. Setup Next.js + Tailwind + Supabase client
2. Jalankan SQL schema di Supabase
3. Tambahkan color palette ke `tailwind.config.ts`
4. Buat `types/media.ts` dan `lib/queries.ts`
5. Komponen: Navbar, Footer, GameCard, CategoryCard
6. Halaman Home — hero, stats, kategori, catalog preview, trending
7. Halaman Catalog — grid + search + filter client-side
8. Halaman Detail — detail media + tombol "Buka Media" + increment plays
9. Halaman Submit — form insert ke Supabase
10. Halaman About
11. Responsive mobile check

---

## Yang TIDAK perlu dibuat
- Login / auth user
- Dashboard guru
- Fitur PRO / paywall
- Upload file (hanya link URL eksternal)
- Notifikasi email
- Admin panel (pakai Supabase Dashboard langsung)
