"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin";
import bcrypt from "bcryptjs";
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

export async function setFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await sql`UPDATE media SET featured = ${featured}, updated_at = now() WHERE id = ${id} AND status = 'approved'`;
    revalidatePath("/"); revalidatePath("/catalog"); revalidatePath("/admin/media");
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

export async function changePassword(current: string, next: string): Promise<ActionResult> {
  const session = await getCurrentAdmin();
  if (!session) return { ok: false, error: "Tidak memiliki akses admin. Silakan login ulang." };
  if (next.length < 8) return { ok: false, error: "Password baru minimal 8 karakter." };
  const rows = await sql`SELECT password_hash FROM admins WHERE id = ${session.adminId} LIMIT 1`;
  const hash = rows[0]?.password_hash as string | undefined;
  if (!hash || !(await bcrypt.compare(current, hash))) {
    return { ok: false, error: "Password lama salah." };
  }
  const newHash = await bcrypt.hash(next, 10);
  await sql`UPDATE admins SET password_hash = ${newHash}, pin_hash = NULL, pin_failed = 0, pin_locked_until = NULL WHERE id = ${session.adminId}`;
  // Ganti password mencabut PIN dan semua perangkat tepercaya (aman bila password sempat bocor)
  await sql`DELETE FROM admin_devices WHERE admin_id = ${session.adminId}`;
  return { ok: true };
}

// ---------- Web Belajar Lain (tautan pihak ketiga) ----------
export async function addWebLink(input: { name: string; url: string; description: string; mapel: string; kategori?: string; cover?: string }): Promise<ActionResult> {
  const denied = await guard(); if (denied) return denied;
  const name = (input.name || "").trim().slice(0, 60);
  const url = normalizeUrl((input.url || "").trim()) ?? "";
  const description = (input.description || "").trim().slice(0, 240);
  const mapel = (input.mapel || "").trim().slice(0, 40) || "Umum";
  const kategori = (input.kategori || "").trim().slice(0, 40) || "Lainnya";
  const coverRaw = (input.cover || "").trim();
  const cover = coverRaw ? (/^https:\/\/[^\s<>"]+$/i.test(coverRaw) ? coverRaw.slice(0, 500) : null) : null;
  if (coverRaw && !cover) return { ok: false, error: "Link gambar cover harus diawali https://" };
  if (!name) return { ok: false, error: "Nama web wajib diisi." };
  if (!url || !/^https:\/\//i.test(url)) return { ok: false, error: "Link harus diawali https://" };
  try {
    await sql`INSERT INTO web_links (name, url, description, mapel, kategori, cover, sort)
      VALUES (${name}, ${url}, ${description}, ${mapel}, ${kategori}, ${cover}, (SELECT COALESCE(MAX(sort), 0) + 1 FROM web_links))`;
    revalidatePath("/"); revalidatePath("/web-belajar"); revalidatePath("/admin/web-belajar");
    return { ok: true };
  } catch (e: unknown) { return { ok: false, error: String(e) }; }
}

export async function deleteWebLink(id: string): Promise<ActionResult> {
  const denied = await guard(); if (denied) return denied;
  try {
    await sql`DELETE FROM web_links WHERE id = ${id}`;
    revalidatePath("/"); revalidatePath("/web-belajar"); revalidatePath("/admin/web-belajar");
    return { ok: true };
  } catch (e: unknown) { return { ok: false, error: String(e) }; }
}

export async function moveWebLink(id: string, dir: -1 | 1): Promise<ActionResult> {
  const denied = await guard(); if (denied) return denied;
  try {
    const rows = (await sql`SELECT id, sort FROM web_links ORDER BY sort, created_at`) as { id: string; sort: number }[];
    const i = rows.findIndex((r) => r.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= rows.length) return { ok: true };
    [rows[i], rows[j]] = [rows[j], rows[i]];
    for (let k = 0; k < rows.length; k++) await sql`UPDATE web_links SET sort = ${k + 1} WHERE id = ${rows[k].id}`;
    revalidatePath("/"); revalidatePath("/web-belajar"); revalidatePath("/admin/web-belajar");
    return { ok: true };
  } catch (e: unknown) { return { ok: false, error: String(e) }; }
}
