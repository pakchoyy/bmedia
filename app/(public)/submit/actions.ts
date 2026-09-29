"use server";

import { sql } from "@/lib/db";
import { normalizeUrl, isValidUrl } from "@/lib/utils";
import { isStoredThumbnail } from "@/lib/storage";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import type { Jenjang, MediaCategory } from "@/types/media";

export interface SubmitInput {
  title: string; mapel: string; jenjang: Jenjang; kelas: string;
  category: MediaCategory; tool: string; link_url: string;
  thumbnail_url: string | null; thumbnail_position: number;
  thumbnail_pos_y: number; thumbnail_zoom: number;
  description: string; guru_name: string; sekolah: string; guru_wa: string;
  website?: string;
}

export async function submitMedia(input: SubmitInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.website) return { ok: true };
  if (!(await allowRequest(`submit:${clientIp()}`, 5, 60 * 60))) {
    return { ok: false, error: "Terlalu banyak kiriman. Coba lagi dalam 1 jam." };
  }
  const normalizedLink = normalizeUrl(input.link_url);
  if (!normalizedLink) return { ok: false, error: "Link media tidak valid." };
  const thumbnail = input.thumbnail_url?.trim() || null;
  if (thumbnail && !isValidUrl(thumbnail) && !isStoredThumbnail(thumbnail)) {
    return { ok: false, error: "URL thumbnail tidak valid." };
  }

  try {
    await sql`
      INSERT INTO media (title, mapel, jenjang, kelas, category, tool, link_url,
        thumbnail_url, thumbnail_position, thumbnail_pos_y, thumbnail_zoom,
        description, guru_name, sekolah, guru_wa, status, plays)
      VALUES (
        ${input.title.trim()}, ${input.mapel}, ${input.jenjang}, ${input.kelas.trim()},
        ${input.category}, ${input.tool.trim() || "Lainnya"}, ${normalizedLink},
        ${thumbnail}, ${input.thumbnail_position}, ${input.thumbnail_pos_y},
        ${input.thumbnail_zoom}, ${input.description.trim()},
        ${input.guru_name.trim()}, ${input.sekolah.trim() || "-"},
        ${input.guru_wa.trim() || "-"}, 'pending', 0
      )
    `;
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: String(e) };
  }
}
