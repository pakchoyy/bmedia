import type { Media } from "@/types/media";
import { sql } from "./db";

export async function getApprovedMedia(): Promise<Media[]> {
  try {
    const rows = await sql`
      SELECT * FROM media WHERE status = 'approved'
      ORDER BY submitted_at DESC
    `;
    return rows as Media[];
  } catch (e) {
    console.error("getApprovedMedia error:", e);
    return [];
  }
}

export async function getMediaById(id: string): Promise<Media | null> {
  try {
    const rows = await sql`
      SELECT * FROM media WHERE id = ${id} AND status = 'approved'
      LIMIT 1
    `;
    return (rows[0] as Media) ?? null;
  } catch (e) {
    console.error("getMediaById error:", e);
    return null;
  }
}

export async function getTrendingMedia(limit = 5): Promise<Media[]> {
  try {
    const rows = await sql`
      SELECT * FROM media WHERE status = 'approved'
      ORDER BY plays DESC LIMIT ${limit}
    `;
    return rows as Media[];
  } catch (e) {
    console.error("getTrendingMedia error:", e);
    return [];
  }
}

export interface SiteStats {
  totalMedia: number;
  totalTeachers: number;
  totalPlays: number;
}

export async function getSiteStats(): Promise<SiteStats> {
  try {
    const rows = await sql`
      SELECT guru_name, plays FROM media WHERE status = 'approved'
    `;
    const teachers = new Set(rows.map((m) => m.guru_name));
    const totalPlays = rows.reduce((acc, m) => acc + (m.plays || 0), 0);
    return { totalMedia: rows.length, totalTeachers: teachers.size, totalPlays };
  } catch (e) {
    console.error("getSiteStats error:", e);
    return { totalMedia: 0, totalTeachers: 0, totalPlays: 0 };
  }
}
