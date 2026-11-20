import { NextResponse } from "next/server";
import { getCurrentGuru } from "@/lib/guru";
import { getRoomForTeacher, settleRoom } from "@/lib/ruang";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Hentikan permainan sekarang. Jika masih di lobi, ruang ditutup tanpa hasil.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const guru = await getCurrentGuru();
  if (!guru) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  if (!UUID.test(params.id)) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  const room = await getRoomForTeacher(params.id, guru.guruId);
  if (!room) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  if (room.status === "playing") await settleRoom(room.id, true);
  else if (room.status === "lobby") await sql`UPDATE rooms SET status = 'finished' WHERE id = ${room.id} AND status = 'lobby'`;
  return NextResponse.json({ ok: true });
}
