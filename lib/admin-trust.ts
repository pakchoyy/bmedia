import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { sql } from "./db";

// Perangkat tepercaya: cookie acak (disimpan di DB hanya hash-nya) yang memungkinkan masuk dengan PIN.
export const TRUST_COOKIE = "bmedia_trust";
export const TRUST_SECONDS = 60 * 60 * 24 * 90; // 90 hari

export const trustCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TRUST_SECONDS,
};

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function createTrustedDevice(adminId: string, label?: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const rows = await sql`
    INSERT INTO admin_devices (admin_id, token_hash, label) VALUES (${adminId}, ${sha(token)}, ${label ?? null})
    RETURNING id
  `;
  return `${(rows[0] as { id: string }).id}.${token}`;
}

/** Cookie perangkat tepercaya yang sah -> id admin & perangkat; selain itu null. */
export async function getTrustedDevice(): Promise<{ deviceId: string; adminId: string } | null> {
  const raw = cookies().get(TRUST_COOKIE)?.value;
  if (!raw) return null;
  const [id, token] = raw.split(".");
  if (!id || !token || !/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f]{64}$/i.test(token)) return null;
  const rows = await sql`SELECT id, admin_id, token_hash FROM admin_devices WHERE id = ${id} LIMIT 1`;
  const r = rows[0] as { id: string; admin_id: string; token_hash: string } | undefined;
  if (!r || r.token_hash !== sha(token)) return null;
  return { deviceId: r.id, adminId: r.admin_id };
}

/** Apakah perangkat ini tepercaya DAN admin-nya punya PIN aktif? (menentukan layar login) */
export async function canLoginWithPin(): Promise<boolean> {
  const d = await getTrustedDevice();
  if (!d) return false;
  const rows = await sql`SELECT pin_hash FROM admins WHERE id = ${d.adminId} LIMIT 1`;
  return !!(rows[0] as { pin_hash: string | null } | undefined)?.pin_hash;
}

const WEAK = new Set(["123456", "654321", "123123", "121212", "112233", "123321", "159753", "246810", "135790", "000000", "111111", "222222", "333333", "444444", "555555", "666666", "777777", "888888", "999999", "010203", "696969", "520520", "142536"]);
export function isWeakPin(pin: string): boolean {
  if (WEAK.has(pin)) return true;
  if (/^(\d)\1{5}$/.test(pin)) return true;
  const d = pin.split("").map(Number);
  const asc = d.every((x, i) => i === 0 || x === d[i - 1] + 1);
  const desc = d.every((x, i) => i === 0 || x === d[i - 1] - 1);
  return asc || desc;
}
