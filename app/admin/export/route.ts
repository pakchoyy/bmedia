import { NextResponse } from "next/server";
import { getCurrentAdmin, getAllMediaForAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s = typeof v === "object" ? JSON.stringify(v) : String(v);
  // Cegah formula injection saat dibuka di Excel/Sheets.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return new NextResponse("Unauthorized", { status: 401 });

  const rows = (await getAllMediaForAdmin()) as unknown as Record<string, unknown>[];
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="backup-media-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
