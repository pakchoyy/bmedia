"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin";
import { sql } from "@/lib/db";
import { normalizeUrl, isValidUrl } from "@/lib/utils";
import { isStoredThumbnail } from "@/lib/storage";
import type { Jenjang, MediaCategory } from "@/types/media";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function guard(): Promise<ActionResult | null> {
  const session = await getCurrentAdmin();
  if (!session) return { ok: false, error: "Tidak memiliki akses admin. Silakan login ulang." };
  return null;
}

export async function approveSubmission(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await sql`UPDATE media SET status = 'approved', rejection_reason = NULL WHERE id = ${id}`;
    revalidatePath("/admin"); revalidatePath("/admin/submissions");
    revalidatePath("/"); revalidatePath("/catalog");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: String(e) };
  }
}

export async function rejectSubmission(id: string, reason: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  if (!reason.trim()) return { ok: false, error: "Alasan penolakan wajib diisi." };
  try {
    await sql`UPDATE media SET status = 'rejected', rejection_reason = ${reason.trim()} WHERE id = ${id}`;
    revalidatePath("/admin"); revalidatePath("/admin/submissions");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await sql`DELETE FROM media WHERE id = ${id}`;
    revalidatePath("/admin"); revalidatePath("/admin/submissions");
    revalidatePath("/admin/media"); revalidatePath("/"); revalidatePath("/catalog");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: String(e) };
  }
}

export interface MediaEditInput {
  title: string; description: string; mapel: string; jenjang: Jenjang;
  kelas: string; category: MediaCategory; tool: string; link_url: string;
  thumbnail_url: string; thumbnail_position?: number | null;
  thumbnail_pos_y?: number | null; thumbnail_zoom?: number | null;
  guru_name: string; sekolah: string; guru_wa: string;
}

export async function createMedia(input: MediaEditInput): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const title = input.title.trim();
  const description = input.description.trim();
  const mapel = input.mapel.trim();
  const kelas = input.kelas.trim();
  const guruName = input.guru_name.trim();

  if (!title) return { ok: false, error: "Judul media wajib diisi." };
  if (!mapel) return { ok: false, error: "Mata pelajaran wajib diisi." };
  if (!jenjangOptions.includes(input.jenjang)) return { ok: false, error: "Jenjang tidak valid." };
  if (!kelas) return { ok: false, error: "Kelas wajib diisi." };
  if (!categoryOptions.includes(input.category)) return { ok: false, error: "Tipe media tidak valid." };
  if (!description) return { ok: false, error: "Deskripsi wajib diisi." };
  if (!guruName) return { ok: false, error: "Nama guru wajib diisi." };

  const normalizedLink = normalizeUrl(input.link_url);
  if (!normalizedLink) return { ok: false, error: "Link media tidak valid." };
  const thumbnail = input.thumbnail_url?.trim() || null;
  if (thumbnail && !isValidUrl(thumbnail) && !isStoredThumbnail(thumbnail)) {
    return { ok: false, error: "URL thumbnail tidak valid." };
  }

  try {
    await sql`
      INSERT INTO media (title, description, mapel, jenjang, kelas, category, tool, link_url,
        thumbnail_url, thumbnail_position, thumbnail_pos_y, thumbnail_zoom,
        guru_name, sekolah, guru_wa, status, plays)
      VALUES (
        ${title}, ${description}, ${mapel}, ${input.jenjang}, ${kelas},
        ${input.category}, ${input.tool.trim() || "Lainnya"}, ${normalizedLink},
        ${thumbnail}, ${input.thumbnail_position ?? 50}, ${input.thumbnail_pos_y ?? 50},
        ${input.thumbnail_zoom ?? 1}, ${guruName}, ${input.sekolah.trim() || "-"},
        ${input.guru_wa.trim() || "-"}, 'approved', 0
      )
    `;
    revalidatePath("/admin/media"); revalidatePath("/"); revalidatePath("/catalog");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: String(e) };
  }
}

export async function updateMedia(id: string, input: MediaEditInput): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const normalizedLink = normalizeUrl(input.link_url);
  if (!normalizedLink) return { ok: false, error: "Link media tidak valid." };
  const thumbnail = input.thumbnail_url?.trim() || null;
  if (thumbnail && !isValidUrl(thumbnail) && !isStoredThumbnail(thumbnail)) {
    return { ok: false, error: "URL thumbnail tidak valid." };
  }

  try {
    await sql`
      UPDATE media SET
        title = ${input.title.trim()}, description = ${input.description.trim()},
        mapel = ${input.mapel.trim()}, jenjang = ${input.jenjang},
        kelas = ${input.kelas.trim()}, category = ${input.category},
        tool = ${input.tool.trim()}, link_url = ${normalizedLink},
        thumbnail_url = ${thumbnail}, thumbnail_position = ${input.thumbnail_position ?? 50},
        thumbnail_pos_y = ${input.thumbnail_pos_y ?? 50}, thumbnail_zoom = ${input.thumbnail_zoom ?? 1},
        guru_name = ${input.guru_name.trim()}, sekolah = ${input.sekolah.trim()},
        guru_wa = ${input.guru_wa.trim()}, updated_at = now()
      WHERE id = ${id}
    `;
    revalidatePath("/admin/submissions"); revalidatePath("/admin/submissions/" + id);
    revalidatePath("/admin/media"); revalidatePath("/"); revalidatePath("/catalog");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: String(e) };
  }
}

const jenjangOptions: Jenjang[] = ["TK", "SD", "SMP", "SMA", "SMK", "Umum"];
const categoryOptions: MediaCategory[] = [
  "Laboratorium Maya", "Multimedia Interaktif", "Game Edukasi",
  "Quiz Interaktif", "Modul Digital", "Video Pembelajaran Interaktif", "Lainnya",
];
