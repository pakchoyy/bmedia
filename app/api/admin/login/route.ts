import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const rows = await sql`SELECT * FROM admins WHERE email = ${email} LIMIT 1`;
  const admin = rows[0] as { id: string; email: string; password_hash: string } | undefined;

  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  const session = await getSession();
  session.adminId = admin.id;
  session.email = admin.email;
  await session.save();

  return NextResponse.json({ ok: true });
}
