// Web belajar pihak ketiga yang direkomendasikan Main-yuk (dikelola di Admin → Web Belajar Lain).
// Main-yuk hanya menautkan; semua hak milik pengelola masing-masing.
import { sql } from "./db";

export interface WebLuar {
  id: string;
  name: string;
  url: string;
  description: string;
  mapel: string;
  kategori: string;
  cover: string | null;
  sort: number;
}

export const WEB_KATEGORI = ["Buat Kuis & Game", "Simulasi & 3D", "Matematika", "Kolaborasi & Desain", "Coding & Seni", "Lainnya"];

export { WEB_COLORS, hostOf } from "./web-link-utils";

export async function getWebLinks(): Promise<WebLuar[]> {
  try {
    return (await sql`SELECT id, name, url, description, mapel, kategori, cover, sort FROM web_links ORDER BY sort, created_at`) as WebLuar[];
  } catch (e) {
    console.error("getWebLinks error:", e);
    return [];
  }
}
