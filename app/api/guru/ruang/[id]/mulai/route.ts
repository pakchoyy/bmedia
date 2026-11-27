import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentGuru } from "@/lib/guru";
import { START_DELAY_S } from "@/lib/ruang";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guru = await getCurrentGuru();
  if (!guru) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  if (!UUID.test(params.id)) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  const duration = [60, 90, 120, 180, 300, 600, 900, 1200].includes(Number(b.duration)) ? Number(b.duration) : 90;
  // Cari Soal Yuk memakai 0 (catat di kertas) / 1 (jawab di game)
  // Cari Soal Yuk: puluhan = soal per kertas (1–5), satuan = 1 jawab di game / 0 catat
  const qe = Number(b.quizEvery);
  const quizEvery = [0, 1, 2, 3, 5].includes(qe) || (Number.isInteger(qe) && qe >= 10 && qe <= 51 && qe % 10 <= 1) ? qe : 3;
  const rows = await sql`
    UPDATE rooms SET status = 'playing', duration_s = ${duration}, quiz_every = ${quizEvery},
      starts_at = now() + make_interval(secs => ${START_DELAY_S}),
      ends_at = now() + make_interval(secs => ${START_DELAY_S + duration})
    WHERE id = ${params.id} AND teacher_id = ${guru.guruId} AND status = 'lobby'
      AND EXISTS (SELECT 1 FROM room_players WHERE room_id = rooms.id)
    RETURNING id
  `;
  if (!rows.length) return NextResponse.json({ error: "Belum ada murid yang bergabung, atau ruang sudah dimulai." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
