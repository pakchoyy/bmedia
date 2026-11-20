import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { isValidCode, normalizeCode } from "@/lib/soal";

export const dynamic = "force-dynamic";

// Tujuan link & QR dari guru: cek kode, lalu buka game dengan set soal itu
export default async function JoinByCode({ params }: { params: { code: string } }) {
  const code = normalizeCode(params.code);
  if (!isValidCode(code)) redirect("/main?e=notfound");
  const rows = await sql`SELECT game FROM question_sets WHERE code = ${code} LIMIT 1`;
  const set = rows[0] as { game: string } | undefined;
  if (!set) redirect("/main?e=notfound");
  redirect(`/game/${set.game}?set=${code}`);
}
