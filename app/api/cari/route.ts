import { NextResponse } from "next/server";
import { search } from "@/lib/search";
import { getSettings, coverKey } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Hasil ringkas untuk dropdown pencarian live (maks 4 per jenis)
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ games: [], karya: [], webs: [], total: 0 });
  const [r, s] = await Promise.all([search(q), getSettings()]);
  return NextResponse.json({
    total: r.games.length + r.karya.length + r.webs.length,
    games: r.games.slice(0, 4).map((g) => ({ href: `/permainan/${g.slug}`, title: g.title, sub: "Karya Admin", img: s[coverKey(g.slug)] || g.preview })),
    karya: r.karya.slice(0, 4).map((m) => ({ href: `/media/${m.id}`, title: m.title, sub: `${m.mapel} · ${m.guru_name}`, img: m.thumbnail_url })),
    webs: r.webs.slice(0, 4).map((w) => ({ href: w.url, title: w.name, sub: w.kategori, img: w.cover, ext: true })),
  }, { headers: { "Cache-Control": "no-store" } });
}
