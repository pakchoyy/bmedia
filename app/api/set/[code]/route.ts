import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isValidCode, normalizeCode } from "@/lib/soal";

export const dynamic = "force-dynamic";

// Publik: dipakai game untuk mengambil soal dari kode kelas
export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const code = normalizeCode(params.code);
  if (!isValidCode(code)) {
    return NextResponse.json({ error: "Kode tidak valid." }, { status: 400 });
  }
  const rows = await sql`
    UPDATE question_sets SET plays = plays + 1
    WHERE code = ${code}
    RETURNING title, subject, grade, questions, game, opts
  `;
  const set = rows[0];
  if (!set) return NextResponse.json({ error: "Kode tidak ditemukan." }, { status: 404 });
  return NextResponse.json(set, { headers: { "Cache-Control": "no-store" } });
}
