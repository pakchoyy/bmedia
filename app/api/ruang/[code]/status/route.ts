import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getRoomByCode, isRoomCode, normalizeRoomCode, settleRoom } from "@/lib/ruang";

export const dynamic = "force-dynamic";

// Murid memeriksa status ruang (lobi / mulai / selesai). Balasan memuat waktu server untuk sinkronisasi.
export async function GET(req: Request, { params }: { params: { code: string } }) {
  const code = normalizeRoomCode(params.code);
  if (!isRoomCode(code)) return NextResponse.json({ error: "Kode tidak valid." }, { status: 400 });
  const url = new URL(req.url);
  const pid = url.searchParams.get("pid") || "";
  const tok = url.searchParams.get("tok") || "";

  let room = await getRoomByCode(code);
  if (!room) return NextResponse.json({ error: "Ruang tidak ditemukan atau sudah ditutup." }, { status: 404 });
  if (await settleRoom(room.id)) room = (await getRoomByCode(code))!;

  const me = pid && tok
    ? ((await sql`SELECT name FROM room_players WHERE id = ${pid} AND room_id = ${room.id} AND token = ${tok} LIMIT 1`)[0] as { name: string } | undefined)
    : undefined;
  const cnt = await sql`SELECT count(*)::int AS n FROM room_players WHERE room_id = ${room.id}`;

  const now = await sql`SELECT (extract(epoch from now()) * 1000)::bigint AS t,
      (extract(epoch from ${room.starts_at}::timestamptz) * 1000)::bigint AS s,
      (extract(epoch from ${room.ends_at}::timestamptz) * 1000)::bigint AS e`;
  const t = now[0] as { t: string; s: string | null; e: string | null };
  return NextResponse.json({
    status: room.status,
    duration: room.duration_s,
    quizEvery: room.quiz_every,
    players: (cnt[0] as { n: number }).n,
    serverNow: Number(t.t),
    startsAt: t.s ? Number(t.s) : null,
    endsAt: t.e ? Number(t.e) : null,
    me: me ? me.name : null,
  }, { headers: { "Cache-Control": "no-store" } });
}
