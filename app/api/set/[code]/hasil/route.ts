import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isValidCode, normalizeCode } from "@/lib/soal";
import { parseHasil } from "@/lib/hasil";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

async function board(setId: string) {
  const rows = await sql`
    SELECT max(player_name) AS name, max(score)::int AS best
    FROM play_results WHERE set_id = ${setId}
    GROUP BY lower(player_name)
    ORDER BY best DESC, min(created_at) ASC
    LIMIT 5
  `;
  return rows as { name: string; best: number }[];
}

// Publik: murid mengirim hasil permainan; balasan berisi papan peringkat kelas
export async function POST(req: Request, { params }: { params: { code: string } }) {
  const code = normalizeCode(params.code);
  if (!isValidCode(code)) return NextResponse.json({ error: "Kode tidak valid." }, { status: 400 });

  const parsed = parseHasil(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (!(await allowRequest(`hasil:${clientIp()}`, 40, 10 * 60))) {
    return NextResponse.json({ error: "Terlalu banyak pengiriman. Coba lagi nanti." }, { status: 429 });
  }

  const sets = await sql`SELECT id FROM question_sets WHERE code = ${code} LIMIT 1`;
  const set = sets[0] as { id: string } | undefined;
  if (!set) return NextResponse.json({ error: "Kode tidak ditemukan." }, { status: 404 });

  const d = parsed.data;
  await sql`
    INSERT INTO play_results (set_id, player_name, mode, score, caught, quiz_right, quiz_wrong, duration_s, q_stats)
    VALUES (${set.id}, ${d.name}, ${d.mode}, ${d.score}, ${d.caught}, ${d.quizRight}, ${d.quizWrong}, ${d.durationS}, ${JSON.stringify(d.qStats)}::jsonb)
  `;
  return NextResponse.json({ ok: true, board: await board(set.id) }, { headers: { "Cache-Control": "no-store" } });
}
