import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`SELECT prompt_count FROM buat_prompt_stats WHERE id = 1`;
  return NextResponse.json(
    { prompt_count: rows[0]?.prompt_count ?? 0 },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}

export async function POST(request: Request) {
  const { kind } = await request.json().catch(() => ({ kind: null }));
  if (kind === "prompt") {
    await sql`UPDATE buat_prompt_stats SET prompt_count = prompt_count + 1, updated_at = now() WHERE id = 1`;
  } else if (kind === "up") {
    await sql`UPDATE buat_prompt_stats SET feedback_up = feedback_up + 1, updated_at = now() WHERE id = 1`;
  } else if (kind === "down") {
    await sql`UPDATE buat_prompt_stats SET feedback_down = feedback_down + 1, updated_at = now() WHERE id = 1`;
  } else {
    return NextResponse.json({ error: "kind tidak valid" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
