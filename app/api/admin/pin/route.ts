import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getTrustedDevice, TRUST_COOKIE } from "@/lib/admin-trust";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Login admin dengan PIN. Hanya berlaku di perangkat tepercaya (cookie khusus) dan dikunci bila salah berulang.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pin = String(body.pin ?? "");
  if (!/^\d{6}$/.test(pin)) return NextResponse.json({ error: "PIN terdiri dari 6 angka." }, { status: 400 });

  if (!(await allowRequest(`pin:${clientIp()}`, 15, 15 * 60))) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi 15 menit lagi." }, { status: 429 });
  }

  const dev = await getTrustedDevice();
  if (!dev) return NextResponse.json({ error: "Perangkat ini belum dipercaya. Masuk dengan password.", needPassword: true }, { status: 401 });

  const rows = await sql`SELECT id, email, pin_hash, pin_failed, pin_locked_until > now() AS locked FROM admins WHERE id = ${dev.adminId} LIMIT 1`;
  const a = rows[0] as { id: string; email: string; pin_hash: string | null; pin_failed: number; locked: boolean } | undefined;
  if (!a || !a.pin_hash) return NextResponse.json({ error: "PIN belum diaktifkan. Masuk dengan password.", needPassword: true }, { status: 401 });
  if (a.locked) return NextResponse.json({ error: "PIN dikunci sementara karena salah berulang. Coba lagi nanti atau masuk dengan password." }, { status: 429 });

  if (!(await bcrypt.compare(pin, a.pin_hash))) {
    const failed = a.pin_failed + 1;
    if (failed >= 15) {
      // Terlalu banyak salah: matikan PIN dan cabut semua perangkat
      await sql`UPDATE admins SET pin_hash = NULL, pin_failed = 0, pin_locked_until = NULL WHERE id = ${a.id}`;
      await sql`DELETE FROM admin_devices WHERE admin_id = ${a.id}`;
      const res = NextResponse.json({ error: "PIN dinonaktifkan karena salah terlalu sering. Masuk dengan password.", needPassword: true }, { status: 401 });
      res.cookies.delete(TRUST_COOKIE);
      return res;
    }
    if (failed % 5 === 0) {
      await sql`UPDATE admins SET pin_failed = ${failed}, pin_locked_until = now() + interval '15 minutes' WHERE id = ${a.id}`;
      return NextResponse.json({ error: "PIN salah 5 kali. Dikunci 15 menit." }, { status: 429 });
    }
    await sql`UPDATE admins SET pin_failed = ${failed} WHERE id = ${a.id}`;
    return NextResponse.json({ error: `PIN salah. Sisa percobaan sebelum dikunci: ${5 - (failed % 5)}.` }, { status: 401 });
  }

  await sql`UPDATE admins SET pin_failed = 0, pin_locked_until = NULL WHERE id = ${a.id}`;
  await sql`UPDATE admin_devices SET last_used = now() WHERE id = ${dev.deviceId}`;
  const session = await getSession();
  session.adminId = a.id;
  session.email = a.email;
  await session.save();
  return NextResponse.json({ ok: true });
}
