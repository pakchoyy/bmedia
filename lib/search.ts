// Pencarian bersama untuk /cari dan /api/cari (dropdown live).
import { sql } from "./db";
import { MAIN_GAMES, type GameInfo } from "./games";
import { getWebLinks, type WebLuar } from "./links";
import type { Media } from "@/types/media";

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

export interface SearchResult { games: GameInfo[]; karya: Media[]; webs: WebLuar[] }

export async function search(q: string): Promise<SearchResult> {
  const words = norm(q.trim().slice(0, 60)).split(/\s+/).filter(Boolean);
  if (!words.length) return { games: [], karya: [], webs: [] };
  const hit = (...f: (string | null | undefined)[]) => { const h = norm(f.filter(Boolean).join(" ")); return words.every((w) => h.includes(w)); };
  const [media, links] = await Promise.all([
    sql`SELECT * FROM media WHERE status = 'approved' ORDER BY featured DESC, plays DESC LIMIT 400`.then((r) => r as Media[]),
    getWebLinks(),
  ]);
  return {
    games: MAIN_GAMES.filter((g) => hit(g.title, g.tagline, g.modes.join(" "), g.mapel, g.fase)),
    karya: media.filter((m) => hit(m.title, m.description, m.mapel, m.guru_name, m.sekolah, m.jenjang, m.kelas, m.category)),
    webs: links.filter((w) => hit(w.name, w.description, w.mapel, w.kategori)),
  };
}
