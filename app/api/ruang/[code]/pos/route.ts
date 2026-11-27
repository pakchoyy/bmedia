import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getRoomByCode, isRoomCode, normalizeRoomCode } from "@/lib/ruang";

export const dynamic = "force-dynamic";

let ready = false;
async function ensureColumn() {
  if (ready) return;
  await sql`ALTER TABLE room_players ADD COLUMN IF NOT EXISTS pos jsonb`;
  ready = true;
}
const num = (v: unknown, lim: number) => { const n = Number(v); return Number.isFinite(n) ? Math.max(-lim, Math.min(lim, n)) : 0; };

// Cari Soal Yuk: murid mengirim posisinya, menerima posisi murid lain di ruang yang sama.
export async function POST(req: Request, { params }: { params: { code: string } }) {
  const code = normalizeRoomCode(params.code);
  if (!isRoomCode(code)) return NextResponse.json({ error: "Kode tidak valid." }, { status: 400 });
  const b = await req.json().catch(() => ({}));
  const pid = String(b.pid || ""), tok = String(b.tok || "");
  if (!pid || !tok) return NextResponse.json({ error: "Tidak sah." }, { status: 401 });
  const room = await getRoomByCode(code);
  if (!room) return NextResponse.json({ error: "Ruang tidak ditemukan." }, { status: 404 });
  await ensureColumn();
  const pos = { x: num(b.x, 100), z: num(b.z, 100), r: num(b.r, 10), f: Math.max(0, Math.min(50, Math.round(num(b.f, 50)))), t: Date.now() };
  const upd = await sql`UPDATE room_players SET pos = ${JSON.stringify(pos)}::jsonb WHERE id = ${pid} AND room_id = ${room.id} AND token = ${tok} RETURNING id`;
  if (!upd.length) return NextResponse.json({ error: "Pemain tidak dikenali." }, { status: 401 });
  const rows = (await sql`
    SELECT id, name, pos FROM room_players
    WHERE room_id = ${room.id} AND id <> ${pid} AND pos IS NOT NULL
      AND (pos->>'t')::bigint > ${Date.now() - 15000}
    ORDER BY name LIMIT 60
  `) as { id: string; name: string; pos: { x: number; z: number; r: number; f: number } }[];
  return NextResponse.json(
    { players: rows.map((p) => ({ id: p.id, name: p.name, x: p.pos.x, z: p.pos.z, r: p.pos.r, f: p.pos.f })) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// Guru: posisi semua murid (peta mini)
export async function GET(req: Request, { params }: { params: { code: string } }) {
  const code = normalizeRoomCode(params.code);
  const room = isRoomCode(code) ? await getRoomByCode(code) : null;
  if (!room) return NextResponse.json({ players: [] });
  await ensureColumn();
  const rows = (await sql`SELECT name, pos FROM room_players WHERE room_id = ${room.id} AND pos IS NOT NULL`) as { name: string; pos: { x: number; z: number; f: number } }[];
  return NextResponse.json({ players: rows.map((p) => ({ name: p.name, x: p.pos.x, z: p.pos.z, f: p.pos.f })) }, { headers: { "Cache-Control": "no-store" } });
}
