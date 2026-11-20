import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cleanName } from "@/lib/hasil";
import { getRoomByCode, isRoomCode, normalizeRoomCode, MAX_PLAYERS } from "@/lib/ruang";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Murid bergabung ke ruang (hanya saat ruang masih di lobi)
export async function POST(req: Request, { params }: { params: { code: string } }) {
  const code = normalizeRoomCode(params.code);
  if (!isRoomCode(code)) return NextResponse.json({ error: "Kode ruang harus 5 angka." }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const name = cleanName(body.name);
  if (!name) return NextResponse.json({ error: "Isi namamu dulu." }, { status: 400 });

  if (!(await allowRequest(`gabung:${clientIp()}`, 60, 10 * 60))) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi sebentar." }, { status: 429 });
  }

  const room = await getRoomByCode(code);
  if (!room) return NextResponse.json({ error: "Ruang tidak ditemukan atau sudah ditutup." }, { status: 404 });
  if (room.status !== "lobby") return NextResponse.json({ error: "Permainan sudah dimulai. Tunggu ruang berikutnya." }, { status: 409 });

  const n = await sql`SELECT count(*)::int AS n FROM room_players WHERE room_id = ${room.id}`;
  if ((n[0] as { n: number }).n >= MAX_PLAYERS) return NextResponse.json({ error: "Ruang sudah penuh." }, { status: 409 });

  const token = crypto.randomUUID().replace(/-/g, "");
  try {
    const rows = await sql`
      INSERT INTO room_players (room_id, name, token) VALUES (${room.id}, ${name}, ${token})
      RETURNING id
    `;
    const sets = await sql`SELECT code FROM question_sets WHERE id = ${room.set_id} LIMIT 1`;
    return NextResponse.json({ ok: true, pid: (rows[0] as { id: string }).id, tok: token, setCode: (sets[0] as { code: string }).code });
  } catch (e) {
    if (String(e).includes("room_players_name_idx")) {
      return NextResponse.json({ error: "Nama itu sudah dipakai di ruang ini. Tambahkan inisial, mis. 'Budi A'." }, { status: 409 });
    }
    throw e;
  }
}
