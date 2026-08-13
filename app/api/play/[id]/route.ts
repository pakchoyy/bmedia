import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSideClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "ID media tidak valid" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 500 });
  }

  const supabase = createServerSideClient();
  const { error } = await supabase.rpc("increment_plays", {
    media_id: id,
  });

  if (error) {
    console.error("increment_plays error:", error.message);
    return NextResponse.json({ error: "Gagal menambah plays" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
