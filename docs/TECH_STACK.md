# Tech Stack — BGY Interactive Learning

## Core
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend/DB:** Supabase
- **Deploy:** Vercel

## Supabase
- `@supabase/supabase-js`
- `@supabase/ssr` (untuk Next.js App Router)

## Struktur Folder

```
bgy-interactive/
├── app/
│   ├── page.tsx                  # Home
│   ├── catalog/
│   │   └── page.tsx              # Catalog semua media
│   ├── media/
│   │   └── [id]/
│   │       └── page.tsx          # Detail media
│   ├── submit/
│   │   └── page.tsx              # Form submit
│   ├── about/
│   │   └── page.tsx              # Tentang
│   └── api/
│       └── play/
│           └── [id]/
│               └── route.ts      # Increment plays via Supabase RPC
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── GameCard.tsx
│   ├── CategoryCard.tsx
│   ├── TrendingSidebar.tsx
│   ├── SearchFilter.tsx
│   └── Toast.tsx
├── lib/
│   ├── supabase.ts               # Supabase client init
│   └── queries.ts                # Fungsi fetch data
├── types/
│   └── media.ts                  # TypeScript interface
└── public/
```

## Color Palette (dari design mockup)
```
primary-blue: #0d7a8a
light-blue:   #0ea5a0
bg-blue:      #e6f6f5
orange:       #d97706
green:        #16a34a
danger:       #dc2626
dark-gray:    #1e293b
```
