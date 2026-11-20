import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getRoomByCode, isRoomCode, leaderboard, normalizeRoomCode, settleRoom } from "@/lib/ruang";

export const dynamic = "force-dynamic";

const clamp = (v: unknown, max: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
};

// Murid mengirim skor sementara/akhir. Balasan: peringkat sendiri + 3 teratas.
export async function POST(req: Request, { params }: { params: { code: string } }) {
  const code = normalizeRoomCode(params.code);
  if (!isRoomCode(code)) return NextResponse.json({ error: "Kode tidak valid." }, { status: 400 });
  const b = await req.json().catch(() => ({}));
  const pid = String(b.pid || ""), tok = String(b.tok || "");
  if (!pid || !tok) return NextResponse.json({ error: "Tidak sah." }, { status: 401 });

  let room = await getRoomByCode(code);
  if (!room) return NextResponse.json({ error: "Ruang tidak ditemukan." }, { status: 404 });
  // Token harus cocok dengan pemain; jika tidak, tolak (jangan bocorkan peringkat)
  const who = await sql`SELECT 1 FROM room_players WHERE id = ${pid} AND room_id = ${room.id} AND token = ${tok} LIMIT 1`;
  if (!who.length) return NextResponse.json({ error: "Pemain tidak dikenali." }, { status: 401 });
  const final = b.final === true;

  // Terima skor selama permainan berlangsung (+ jeda kecil setelah waktu habis)
  const open = await sql`SELECT 1 FROM rooms WHERE id = ${room.id} AND status = 'playing' AND now() <= ends_at + interval '6 seconds'`;
  if (open.length) {
    // Batasi frekuensi: abaikan bila pembaruan terlalu rapat (kecuali skor akhir)
    await sql`
      UPDATE room_players SET
        score = GREATEST(score, ${clamp(b.score, 20000)}),
        caught = GREATEST(caught, ${clamp(b.caught, 500)}),
        quiz_right = GREATEST(quiz_right, ${clamp(b.quizRight, 300)}),
        quiz_wrong = GREATEST(quiz_wrong, ${clamp(b.quizWrong, 300)}),
        finished = finished OR ${final},
        updated_at = now()
      WHERE id = ${pid} AND room_id = ${room.id} AND token = ${tok}
        AND (${final} OR updated_at < now() - interval '600 milliseconds')
    `;
  }
  if (await settleRoom(room.id)) room = (await getRoomByCode(code))!;

  const all = await leaderboard(room.id, 200);
  const idx = all.findIndex((p) => p.id === pid);
  if (idx < 0) return NextResponse.json({ error: "Pemain tidak dikenali." }, { status: 401 });
  return NextResponse.json({
    ok: true,
    status: room.status,
    rank: idx + 1,
    total: all.length,
    score: all[idx].score,
    top: all.slice(0, 5).map((p) => ({ name: p.name, score: p.score, me: p.id === pid })),
  }, { headers: { "Cache-Control": "no-store" } });
}
