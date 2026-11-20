import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { getGuruSession } from "@/lib/guru";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nama, email, dan password wajib diisi." }, { status: 400 });
  }
  if (name.length > 80) return NextResponse.json({ error: "Nama terlalu panjang." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
  }
  if (!(await allowRequest(`guru-daftar:${clientIp()}`, 5, 60 * 60))) {
    return NextResponse.json({ error: "Terlalu banyak pendaftaran. Coba lagi nanti." }, { status: 429 });
  }

  const exists = await sql`SELECT 1 FROM teachers WHERE email = ${email} LIMIT 1`;
  if (exists.length) {
    return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  const rows = await sql`
    INSERT INTO teachers (name, email, password_hash)
    VALUES (${name}, ${email}, ${hash})
    RETURNING id, name, email
  `;
  const t = rows[0] as { id: string; name: string; email: string };

  const session = await getGuruSession();
  session.guruId = t.id;
  session.name = t.name;
  session.email = t.email;
  await session.save();

  return NextResponse.json({ ok: true });
}
