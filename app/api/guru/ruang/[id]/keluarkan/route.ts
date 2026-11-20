import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentGuru } from "@/lib/guru";
import { getRoomForTeacher } from "@/lib/ruang";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Guru mengeluarkan seorang murid dari lobi (mis. nama tidak pantas)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const guru = await getCurrentGuru();
  if (!guru) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  if (!UUID.test(params.id)) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  const room = await getRoomForTeacher(params.id, guru.guruId);
  if (!room) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  const pid = String(b.pid || "");
  if (!UUID.test(pid)) return NextResponse.json({ error: "Murid tidak valid." }, { status: 400 });
  await sql`DELETE FROM room_players WHERE id = ${pid} AND room_id = ${room.id} AND ${room.status} = 'lobby'`;
  return NextResponse.json({ ok: true });
}
