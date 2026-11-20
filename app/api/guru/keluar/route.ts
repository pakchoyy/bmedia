import { NextResponse } from "next/server";
import { getGuruSession } from "@/lib/guru";

export async function POST() {
  const session = await getGuruSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
