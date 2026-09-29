import { headers } from "next/headers";
import { sql } from "./db";

export function clientIp(): string {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function allowRequest(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const rows = await sql`
    SELECT COUNT(*)::int AS n FROM rate_limits
    WHERE key = ${key} AND at > now() - make_interval(secs => ${windowSeconds})
  `;
  if ((rows[0]?.n ?? 0) >= limit) return false;
  await sql`INSERT INTO rate_limits (key) VALUES (${key})`;
  if (Math.random() < 0.05) await sql`DELETE FROM rate_limits WHERE at < now() - interval '1 day'`;
  return true;
}
