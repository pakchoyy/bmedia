import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getGame } from "@/lib/games";
import { allowRequest, clientIp } from "@/lib/rate-limit";

// Hitung "dimainkan" untuk Karya Admin. Varian (mis. Layar Bersama) dihitung ke game induk.
// Satu perangkat dihitung maksimal sekali per 10 menit per game agar angka tidak membengkak.
export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  const g = getGame(params.slug);
  if (!g) return NextResponse.json({ ok: false }, { status: 404 });
  const slug = g.parent ?? g.slug;
  if (await allowRequest(`gp:${clientIp()}:${slug}`, 1, 10 * 60)) {
    await sql`INSERT INTO game_plays (slug, plays) VALUES (${slug}, 1)
      ON CONFLICT (slug) DO UPDATE SET plays = game_plays.plays + 1, updated_at = now()`;
  }
  return NextResponse.json({ ok: true });
}
