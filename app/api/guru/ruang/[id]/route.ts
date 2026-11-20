import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentGuru } from "@/lib/guru";
import { getRoomForTeacher, leaderboard, settleRoom } from "@/lib/ruang";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Guru memantau ruangnya (lobi, skor langsung, hasil)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guru = await getCurrentGuru();
  if (!guru) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  if (!UUID.test(params.id)) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  let room = await getRoomForTeacher(params.id, guru.guruId);
  if (!room) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  if (await settleRoom(room.id)) room = (await getRoomForTeacher(params.id, guru.guruId))!;

  const t = await sql`SELECT (extract(epoch from now()) * 1000)::bigint AS t,
      (extract(epoch from ${room.starts_at}::timestamptz) * 1000)::bigint AS s,
      (extract(epoch from ${room.ends_at}::timestamptz) * 1000)::bigint AS e`;
  const x = t[0] as { t: string; s: string | null; e: string | null };
  const players = await leaderboard(room.id);
  return NextResponse.json({
    code: room.code,
    status: room.status,
    duration: room.duration_s,
    quizEvery: room.quiz_every,
    serverNow: Number(x.t),
    startsAt: x.s ? Number(x.s) : null,
    endsAt: x.e ? Number(x.e) : null,
    players,
  }, { headers: { "Cache-Control": "no-store" } });
}
