"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getCurrentGuru } from "@/lib/guru";
import { randomCode, validateSoal } from "@/lib/soal";
import { getGame } from "@/lib/games";
import { randomRoomCode } from "@/lib/ruang";

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function createSet(gameSlug?: string): Promise<void> {
  const guru = await getCurrentGuru();
  if (!guru) redirect("/guru/masuk");
  const g = gameSlug ? getGame(gameSlug) : undefined;
  const game = g && !g.noSet ? g.slug : "kupu-kupu";
  const title = g && !g.noSet ? `Soal ${g.title}` : "Set Soal Baru";

  let id: string | null = null;
  // Ulangi jika kode kebetulan sudah dipakai
  for (let i = 0; i < 5 && !id; i++) {
    try {
      const rows = await sql`
        INSERT INTO question_sets (teacher_id, title, code, game)
        VALUES (${guru.guruId}, ${title}, ${randomCode()}, ${game})
        RETURNING id
      `;
      id = (rows[0] as { id: string }).id;
    } catch (e) {
      if (!String(e).includes("question_sets_code_key")) throw e;
    }
  }
  if (!id) throw new Error("Gagal membuat kode kelas. Coba lagi.");
  revalidatePath("/guru");
  redirect(`/guru/set/${id}`);
}

export async function saveSet(
  id: string,
  data: { title: string; subject: string; grade: string; questions: unknown; game?: string }
): Promise<SaveResult> {
  const guru = await getCurrentGuru();
  if (!guru) return { ok: false, error: "Sesi berakhir. Silakan masuk lagi." };

  const title = String(data.title ?? "").trim();
  if (!title) return { ok: false, error: "Judul set soal wajib diisi." };
  if (title.length > 120) return { ok: false, error: "Judul terlalu panjang." };
  const subject = String(data.subject ?? "").trim().slice(0, 60) || null;
  const grade = String(data.grade ?? "").trim().slice(0, 40) || null;

  const game = data.game && getGame(data.game) && !getGame(data.game)!.noSet ? data.game : "kupu-kupu";
  const v = validateSoal(data.questions);
  if (!v.ok) return v;
  if (!v.soal.length) return { ok: false, error: "Tambahkan minimal 1 soal." };

  const rows = await sql`
    UPDATE question_sets
    SET title = ${title}, subject = ${subject}, grade = ${grade}, game = ${game},
        questions = ${JSON.stringify(v.soal)}::jsonb, updated_at = now()
    WHERE id = ${id} AND teacher_id = ${guru.guruId}
    RETURNING id
  `;
  if (!rows.length) return { ok: false, error: "Set soal tidak ditemukan." };
  revalidatePath("/guru");
  revalidatePath(`/guru/set/${id}`);
  return { ok: true };
}

export async function deleteSet(id: string): Promise<void> {
  const guru = await getCurrentGuru();
  if (!guru) redirect("/guru/masuk");
  await sql`DELETE FROM question_sets WHERE id = ${id} AND teacher_id = ${guru.guruId}`;
  revalidatePath("/guru");
  redirect("/guru");
}

// Mabar Online: buat ruang baru untuk set soal ini lalu buka layar pantau
export async function startRoom(setId: string): Promise<void> {
  const guru = await getCurrentGuru();
  if (!guru) redirect("/guru/masuk");
  const own = await sql`SELECT id FROM question_sets WHERE id = ${setId} AND teacher_id = ${guru.guruId} LIMIT 1`;
  if (!own.length) redirect("/guru");

  // Tutup ruang lama milik guru ini yang belum selesai agar tidak menumpuk
  await sql`UPDATE rooms SET status = 'finished' WHERE teacher_id = ${guru.guruId} AND status = 'lobby'`;

  let id: string | null = null;
  for (let i = 0; i < 8 && !id; i++) {
    try {
      const rows = await sql`
        INSERT INTO rooms (code, set_id, teacher_id) VALUES (${randomRoomCode()}, ${setId}, ${guru.guruId})
        RETURNING id
      `;
      id = (rows[0] as { id: string }).id;
    } catch (e) {
      if (!String(e).includes("rooms_code_key")) throw e;
    }
  }
  if (!id) throw new Error("Gagal membuat ruang. Coba lagi.");
  redirect(`/guru/ruang/${id}`);
}
