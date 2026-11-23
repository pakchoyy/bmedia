import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin";
import { createTrustedDevice, isWeakPin, TRUST_COOKIE, trustCookieOptions } from "@/lib/admin-trust";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Atur PIN (butuh sesi admin + password saat ini). Opsional: percayai perangkat ini.
export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Silakan login ulang." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const password = String(b.password ?? "");
  const pin = String(b.pin ?? "");
  if (!/^\d{6}$/.test(pin)) return NextResponse.json({ error: "PIN harus 6 angka." }, { status: 400 });
  if (isWeakPin(pin)) return NextResponse.json({ error: "PIN terlalu mudah ditebak (mis. 123456 atau 111111). Pilih yang lain." }, { status: 400 });
  if (!(await allowRequest(`pinset:${clientIp()}`, 10, 15 * 60))) return NextResponse.json({ error: "Terlalu banyak percobaan." }, { status: 429 });

  const rows = await sql`SELECT password_hash FROM admins WHERE id = ${admin.adminId} LIMIT 1`;
  const hash = (rows[0] as { password_hash: string } | undefined)?.password_hash;
  if (!hash || !(await bcrypt.compare(password, hash))) return NextResponse.json({ error: "Password saat ini salah." }, { status: 401 });

  await sql`UPDATE admins SET pin_hash = ${await bcrypt.hash(pin, 10)}, pin_failed = 0, pin_locked_until = NULL WHERE id = ${admin.adminId}`;
  const res = NextResponse.json({ ok: true, trusted: b.trust === true });
  if (b.trust === true) {
    const ua = (req.headers.get("user-agent") || "").slice(0, 80);
    res.cookies.set(TRUST_COOKIE, await createTrustedDevice(admin.adminId, ua), trustCookieOptions);
  }
  return res;
}
