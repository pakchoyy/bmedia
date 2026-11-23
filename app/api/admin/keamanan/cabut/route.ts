import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin";
import { TRUST_COOKIE } from "@/lib/admin-trust";

export const dynamic = "force-dynamic";

// Matikan PIN dan cabut semua perangkat tepercaya
export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Silakan login ulang." }, { status: 401 });
  await sql`UPDATE admins SET pin_hash = NULL, pin_failed = 0, pin_locked_until = NULL WHERE id = ${admin.adminId}`;
  await sql`DELETE FROM admin_devices WHERE admin_id = ${admin.adminId}`;
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(TRUST_COOKIE);
  return res;
}
