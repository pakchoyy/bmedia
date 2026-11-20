import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { getGuruSession } from "@/lib/guru";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }
  if (!(await allowRequest(`guru-masuk:${clientIp()}`, 10, 15 * 60))) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi 15 menit lagi." }, { status: 429 });
  }

  const rows = await sql`SELECT id, name, email, password_hash FROM teachers WHERE email = ${email} LIMIT 1`;
  const t = rows[0] as { id: string; name: string; email: string; password_hash: string } | undefined;
  if (!t || !(await bcrypt.compare(password, t.password_hash))) {
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  const session = await getGuruSession();
  session.guruId = t.id;
  session.name = t.name;
  session.email = t.email;
  await session.save();
  return NextResponse.json({ ok: true });
}
