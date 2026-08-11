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

   Jalankan `supabase/schema.sql` di Supabase SQL Editor (membuat tabel `media`, RLS, index, dan RPC `increment_plays`).

3. **Environment variables**

   Salin `.env.example` menjadi `.env.local` lalu isi:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   ```

4. **Jalankan dev server**

   ```bash
   npm run dev
   ```

   Buka http://localhost:3000

---

## Struktur Folder

```
app/
├── page.tsx                  # Home
├── catalog/page.tsx          # Katalog + search/filter/sort (client-side) + infinite scroll
├── media/[id]/page.tsx       # Detail media + tombol "Buka Media" + plays counter
├── submit/page.tsx           # Form submit publik → status pending
├── about/page.tsx            # Tentang
└── api/play/[id]/route.ts    # Increment plays via Supabase RPC
components/
├── Navbar.tsx / Footer.tsx
├── HomeCatalog.tsx           # Preview home + pencarian + quick filter
├── SearchFilter.tsx          # Filter lengkap katalog (client-side)
├── GameCard.tsx / CategoryCard.tsx / TrendingSidebar.tsx
├── PlayButton.tsx / SubmitForm.tsx / Stats.tsx / Toast.tsx
├── MediaThumb.tsx / Icon.tsx
lib/
├── supabase.ts               # Client init
├── queries.ts                # Fetch data (server)
└── constants.ts / utils.ts
types/media.ts
supabase/schema.sql           # SQL schema + RLS + RPC
```

## Fitur

- Home: hero, stats animasi, kategori, preview media terbaru, trending
- Katalog: search, filter (kategori/jenjang/tool), sort (terbaru/populer), infinite scroll
- Detail: banner, info, rekomendasi, tombol "Buka Media" (+1 plays via RPC)
- Submit: form publik tanpa login → status `pending`, menunggu review admin
- Admin pakai Supabase Dashboard langsung (approve/reject, kelola data)

## Deploy ke Vercel

Import repo ke Vercel, tambahkan env vars di dashboard, lalu deploy. Semua halaman yang fetch data bersifat `force-dynamic`, jadi konten selalu terbaru.
