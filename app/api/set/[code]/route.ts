import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isValidCode, normalizeCode } from "@/lib/soal";

export const dynamic = "force-dynamic";

// Publik: dipakai game untuk mengambil soal dari kode kelas
export async function GET(req: Request, { params }: { params: { code: string } }) {
  const code = normalizeCode(params.code);
  if (!isValidCode(code)) {
    return NextResponse.json({ error: "Kode tidak valid." }, { status: 400 });
  }
  // ?cek=1: hanya cek ruang Mabar yang terbuka (tanpa menambah hitungan main)
  if (new URL(req.url).searchParams.get("cek")) {
    const rr = await sql`SELECT r.code FROM rooms r JOIN question_sets q ON q.id = r.set_id
      WHERE q.code = ${code} AND r.status = 'lobby' AND r.created_at > now() - interval '12 hours'
      ORDER BY r.created_at DESC LIMIT 1`;
    return NextResponse.json({ room: rr[0]?.code ?? null }, { headers: { "Cache-Control": "no-store" } });
  }
  const rows = await sql`
    UPDATE question_sets SET plays = plays + 1
    WHERE code = ${code}
    RETURNING title, subject, grade, questions, game, opts
  `;
  const set = rows[0];
  if (!set) return NextResponse.json({ error: "Kode tidak ditemukan." }, { status: 404 });
  // Ruang Mabar yang sedang dibuka guru untuk set ini (agar murid tidak main sendiri)
  const rr = await sql`SELECT r.code FROM rooms r JOIN question_sets q ON q.id = r.set_id
    WHERE q.code = ${code} AND r.status = 'lobby' AND r.created_at > now() - interval '12 hours'
    ORDER BY r.created_at DESC LIMIT 1`;
  set.room = rr[0]?.code ?? null;
  return NextResponse.json(set, { headers: { "Cache-Control": "no-store" } });
}
