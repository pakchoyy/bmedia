// Web belajar pihak ketiga yang direkomendasikan Main-yuk (dikelola di Admin → Web Belajar Lain).
// Main-yuk hanya menautkan; semua hak milik pengelola masing-masing.
import { sql } from "./db";

export interface WebLuar {
  id: string;
  name: string;
  url: string;
  description: string;
  mapel: string;
  sort: number;
}

export { WEB_COLORS, hostOf } from "./web-link-utils";

export async function getWebLinks(): Promise<WebLuar[]> {
  try {
    return (await sql`SELECT id, name, url, description, mapel, sort FROM web_links ORDER BY sort, created_at`) as WebLuar[];
  } catch (e) {
    console.error("getWebLinks error:", e);
    return [];
  }
}
