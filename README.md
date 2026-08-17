# BGY Interactive Learning

Platform berbagi media pembelajaran interaktif karya guru Indonesia. Bagian dari ekosistem **Bantu Guru Yuk (BGY)** di `bantuguruyuk.web.id`.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · Vercel

---

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Konfigurasi Supabase**

   Jalankan `supabase/schema.sql` di Supabase SQL Editor (tabel `media`, `profiles`, RLS, index, trigger, dan RPC `increment_plays`).

3. **Environment variables**

   Salin `.env.example` menjadi `.env.local` lalu isi:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   ```

4. **Buat admin pertama**

   Buat user di Supabase Auth, lalu:

   ```sql
   update profiles set role = 'admin' where email = 'EMAIL_ADMIN';
   ```

5. **Jalankan dev server**

   ```bash
   npm run dev
   ```

   Buka http://localhost:3000

---

## Struktur Folder

```
app/
├── (public)/                  # Halaman publik (Navbar + Footer)
│   ├── page.tsx               # Home
│   ├── catalog/page.tsx       # Katalog + search/filter/sort (client-side) + infinite scroll
│   ├── media/[id]/page.tsx    # Detail media + "Buka Media" + plays counter
│   ├── submit/page.tsx        # Form submit publik → status pending
│   └── about/page.tsx         # Tentang
├── admin/                     # Admin dashboard (login publik, sisanya protected)
│   ├── login/page.tsx         # Login Supabase Auth
│   ├── (protected)/           # Hanya admin (requireAdmin + middleware + RLS)
│   │   ├── layout.tsx         # Shell admin (sidebar + header)
│   │   ├── page.tsx           # Dashboard statistik
│   │   └── submissions/       # List + detail + approve/reject/edit/delete
│   └── actions.ts             # Server Actions (approve, reject, delete, update)
└── api/play/[id]/route.ts     # Increment plays via RPC increment_plays
components/
├── Navbar.tsx / Footer.tsx
├── HomeCatalog.tsx / SearchFilter.tsx
├── GameCard.tsx / CategoryCard.tsx / TrendingSidebar.tsx
├── PlayButton.tsx / SubmitForm.tsx / Stats.tsx / Toast.tsx
├── MediaThumb.tsx / Icon.tsx
└── admin/
    ├── AdminShell.tsx / AdminSidebar.tsx / AdminHeader.tsx
    ├── AdminStats.tsx / SubmissionTable.tsx / SubmissionDetail.tsx
    ├── RejectDialog.tsx / ConfirmDialog.tsx / LoginForm.tsx / StatusBadge.tsx
lib/
├── supabase.ts                # Client browser (anon)
├── supabase-server.ts         # Server client (session/cookies)
├── admin.ts                   # requireAdmin + query admin
└── queries.ts / constants.ts / utils.ts
middleware.ts                  # Proteksi /admin/* (session)
types/ (media.ts, admin.ts)
supabase/
├── schema.sql                 # Fresh install lengkap
└── 2025_admin_dashboard.sql   # Migration admin dashboard
```

## Fitur

### Publik
- Home: hero, stats animasi, kategori, media terbaru, trending
- Katalog: search, filter (kategori/jenjang/tool), sort (terbaru/populer), infinite scroll
- Detail: banner, info, rekomendasi, tombol "Buka Media" (+1 plays via RPC)
- Submit: form publik tanpa login → status `pending`

### Admin (`/admin`)
- Login Supabase Auth (email + password)
- Dashboard statistik (Total, Pending, Approved, Rejected, Total Plays)
- Review submission: **Approve**, **Reject** (dengan alasan), **Edit**, **Delete**
- Hanya menampilkan yang `approved` di website publik

## Keamanan
- RLS: publik hanya baca `approved` + insert `pending`; admin (role dari `profiles`) bisa select/update/delete semua
- Middleware + verifikasi role di server component + RLS (defense in depth)
- Hanya anon key di client; operasi admin lewat session + RLS
- `increment_plays` memakai `security definer` (tanpa izin UPDATE umum ke anon)

## Deploy ke Vercel

Import repo ke Vercel, tambahkan env vars di dashboard, lalu deploy. Halaman yang fetch data bersifat `force-dynamic`.

## Troubleshooting

Jika halaman GitHub menampilkan "Cannot retrieve latest commit at this time", itu error sementara dari sisi GitHub, bukan dari repo. Refresh halaman (Ctrl+Shift+R) atau tunggu beberapa menit.
