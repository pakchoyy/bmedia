"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setGameMeta } from "@/app/admin/actions";
import type { GameMeta } from "@/lib/settings";

const input = "w-full rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm text-gray-900 dark:text-white";

/** Ubah badge mapel/fase dan deskripsi satu game Karya Admin. */
export default function GameMetaForm({ slug, meta }: { slug: string; meta: GameMeta }) {
  const router = useRouter();
  const [f, setF] = useState(meta);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await setGameMeta(slug, f); setMsg(r.ok ? "Tersimpan." : r.error); if (r.ok) router.refresh(); }); }}>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Mapel<input className={input} maxLength={60} value={f.mapel} onChange={(e) => setF({ ...f, mapel: e.target.value })} /></label>
        <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Kelas / fase<input className={input} maxLength={40} value={f.fase} onChange={(e) => setF({ ...f, fase: e.target.value })} /></label>
      </div>
      <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Deskripsi singkat<textarea className={input} rows={2} maxLength={300} value={f.deskripsi} onChange={(e) => setF({ ...f, deskripsi: e.target.value })} /></label>
      <div className="flex items-center gap-2">
        <button disabled={pending} className="rounded-lg bg-nb-mint border-2 border-nb-ink px-3 py-1.5 text-sm font-bold text-nb-ink">{pending ? "Menyimpan…" : "Simpan info"}</button>
        {msg && <span role="status" className="text-xs font-semibold text-gray-600">{msg}</span>}
      </div>
    </form>
  );
}
