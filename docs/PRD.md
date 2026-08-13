# PRD — BGY Interactive Learning
**Platform:** bantuguruyuk.web.id/interactive (atau subdomain interactive.bantuguruyuk.web.id)  
**Stack:** Next.js 14 App Router + Supabase + Tailwind CSS + deploy Vercel  
**Status:** v1.0 — MVP

---

## 1. Tujuan
Platform berbagi media pembelajaran interaktif karya guru Indonesia. Guru submit karya (link eksternal), admin review, publik bisa cari dan buka media tersebut.

---

## 2. User Roles

| Role | Kemampuan |
|------|-----------|
| **Publik** | Browse, search, filter, buka link media |
| **Admin** | Login via `/admin`, review submission, approve/reject, edit, delete |

Tidak ada fitur login untuk user umum.

---

## 3. Halaman & Fitur

### 3.1 Home (`/`)
- Hero section + tagline
- Stats: jumlah media, guru, sekolah (fetch dari Supabase)
- Kategori (5 kategori, klik → filter catalog)
- Catalog preview (12 media terbaru, approved)
- Trending sidebar (5 media paling banyak dibuka)
- CTA submit media

### 3.2 Catalog (`/catalog`)
- Grid semua media (status: `approved`)
- Search: real-time client-side by judul, mapel, guru
- Filter: kategori, jenjang (SD/SMP/SMA), tool
- Sort: terbaru, terpopuler
- Pagination atau infinite scroll (pilih: **infinite scroll**)

### 3.3 Detail Media (`/media/[id]`)
- Banner thumbnail (dari URL yang di-input guru)
- Judul, mapel, jenjang, kelas, kategori, tool
- Deskripsi
- Info guru + sekolah
- Tombol **"Buka Media"** → `window.open(link_url, '_blank')`
- Counter `plays` increment +1 setiap klik "Buka Media"
- Rekomendasi 3 media lain (mapel sama, random)

### 3.4 Submit Media (`/submit`)
- Form publik, tidak perlu login
- Field: lihat Section 4
- Submit → status `pending`, tampil pesan sukses
- Admin melakukan review melalui Admin Dashboard `/admin`

### 3.5 Admin (`/admin`)
- Login admin via Supabase Auth (`/admin/login`)
- Dashboard statistik (Total, Pending, Approved, Rejected, Total Plays)
- Daftar submission + filter status + search (`/admin/submissions`)
- Detail submission (`/admin/submissions/[id]`) — info lengkap + buka link review
- Aksi: **Approve**, **Reject** (dengan alasan), **Edit**, **Delete**
- Logout

### 3.6 Tentang (`/about`)
- Deskripsi platform, kontak admin

---

## 4. Form Submit Media

| Field | Type | Required |
|-------|------|----------|
| Nama Guru | text | ✅ |
| Asal Sekolah | text | ✅ |
| Nomor WA | text | ✅ |
| Judul Media | text | ✅ |
| Mata Pelajaran | text | ✅ |
| Jenjang | select (SD/SMP/SMA/SMK/Umum) | ✅ |
| Kelas | text | ✅ |
| Kategori | select | ✅ |
| Dibuat dengan (tool) | text | ✅ |
| Link Media | url | ✅ |
| URL Thumbnail | url | ❌ (opsional) |
| Deskripsi Singkat | textarea | ✅ |

---

## 5. Kategori Media
1. Laboratorium Maya
2. Multimedia Interaktif
3. Game Edukasi
4. Quiz Interaktif
5. Modul Digital

---

## 6. Filter & Search
- Dilakukan **client-side** dari data yang sudah di-fetch
- Fetch semua media `approved` saat halaman load
- Filter: kategori, jenjang, tool
- Search: judul + mapel + nama guru (case-insensitive)

---

## 7. Fitur Plays Counter
- Setiap klik "Buka Media" → hit API route Next.js `/api/play/[id]`
- API route memanggil RPC Supabase `increment_plays(media_id)` (`plays + 1`)
- RPC dibuat `security definer` agar anon tidak perlu izin UPDATE umum
- Tidak ada debounce/auth — sederhana dulu

---

## 8. Admin Panel
- **Auth:** Supabase Auth (email + password), role admin ditentukan dari tabel `profiles`
- **Route:** `/admin`, `/admin/login`, `/admin/submissions`, `/admin/submissions/[id]`
- **Keamanan:** middleware + verifikasi role di server component + RLS Supabase
- Status: `pending` (orange), `approved` (green), `rejected` (red) + `rejection_reason`

---

## 9. Out of Scope (v1)
- Login user (publik)
- Komentar / rating
- Fitur PRO / berbayar
- Upload file media (hanya link eksternal)
- Notifikasi email ke guru saat approved
- Dashboard guru

---

## 10. Design Reference
- File: `design-mockup.html` (terlampir)
- Color palette, komponen, dan layout sudah final di mockup
- Implementasi ulang dalam Tailwind CSS mengikuti design tersebut
