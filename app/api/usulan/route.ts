import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { allowRequest, clientIp } from "@/lib/rate-limit";

const JENIS = ["Usulan game", "Kendala / error", "Saran tampilan", "Lainnya"];
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

// Publik: pengunjung mengirim usulan atau laporan kendala
export async function POST(req: Request) {
  if (!(await allowRequest(`usulan:${clientIp()}`, 5, 60 * 60))) {
    return NextResponse.json({ error: "Terlalu banyak kiriman. Coba lagi nanti ya." }, { status: 429 });
  }
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Data tidak valid." }, { status: 400 }); }
  if (clean(b.website, 50)) return NextResponse.json({ ok: true }); // jebakan bot
  const pesan = typeof b.pesan === "string" ? b.pesan.trim().slice(0, 2000) : "";
  if (pesan.length < 5) return NextResponse.json({ error: "Tulis pesanmu minimal 5 huruf." }, { status: 400 });
  const jenis = JENIS.includes(String(b.jenis)) ? String(b.jenis) : "Lainnya";
  await sql`INSERT INTO usulan (nama, kontak, jenis, pesan) VALUES (${clean(b.nama, 60)}, ${clean(b.kontak, 80)}, ${jenis}, ${pesan})`;
  return NextResponse.json({ ok: true });
}
