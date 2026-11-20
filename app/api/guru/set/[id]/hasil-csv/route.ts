import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentGuru } from "@/lib/guru";
import { getHasil } from "@/lib/hasil-query";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Cegah "CSV injection": sel yang diawali = + - @ dianggap rumus oleh Excel
const cell = (v: string | number) => {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guru = await getCurrentGuru();
  if (!guru) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  if (!UUID.test(params.id)) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  const sets = await sql`SELECT id, title, code FROM question_sets WHERE id = ${params.id} AND teacher_id = ${guru.guruId} LIMIT 1`;
  const set = sets[0] as { id: string; title: string; code: string } | undefined;
  if (!set) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });

  const rows = await getHasil(set.id, 5000);
  const lines = [["Waktu (WIB)", "Nama", "Mode", "Skor", "Kupu tertangkap", "Kuis benar", "Kuis salah", "Durasi (detik)"].map(cell).join(",")];
  for (const r of rows) {
    const t = new Date(r.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    lines.push([t, r.player_name, ({ free: "Bebas", edu: "Edukasi", race: "Balap", online: "Mabar" } as Record<string, string>)[r.mode] ?? r.mode, r.score, r.caught, r.quiz_right, r.quiz_wrong, r.duration_s].map(cell).join(","));
  }
  const body = "﻿" + lines.join("\r\n");
  const safe = set.title.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").slice(0, 40) || "hasil";
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hasil-${safe}-${set.code}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
