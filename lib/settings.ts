// Pengaturan tampilan yang bisa diubah admin (cover hero & cover game).
import { sql } from "./db";

export type Settings = Record<string, string>;

export async function getSettings(): Promise<Settings> {
  try {
    const rows = (await sql`SELECT key, value FROM site_settings`) as { key: string; value: string }[];
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch (e) {
    console.error("getSettings error:", e);
    return {};
  }
}

export const HERO_KEY = "hero_banner";
export const HERO_DEFAULT = "/hero-banner.webp";
export const coverKey = (slug: string) => `cover_${slug}`;
