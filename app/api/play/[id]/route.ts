import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID media tidak valid" }, { status: 400 });
  }
  try {
    await sql`UPDATE media SET plays = plays + 1 WHERE id = ${id} AND status = 'approved'`;
  } catch (e) {
    console.error("increment plays error:", e);
    return NextResponse.json({ error: "Gagal menambah plays" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
