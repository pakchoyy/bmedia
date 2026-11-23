"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addWebLink, deleteWebLink, moveWebLink } from "@/app/admin/actions";
import { hostOf } from "@/lib/web-link-utils";
import type { WebLuar } from "@/lib/links";

const KATEGORI = ["Buat Kuis & Game", "Simulasi & 3D", "Matematika", "Kolaborasi & Desain", "Coding & Seni", "Lainnya"];
import Icon from "@/components/Icon";

const input = "w-full rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-nb-ink";

export default function WebLinkManager({ links }: { links: WebLuar[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState({ name: "", url: "", description: "", mapel: "", kategori: KATEGORI[0], cover: "" });

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, after?: () => void) =>
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? { ok: true, text: okText } : { ok: false, text: r.error || "Gagal." });
      if (r.ok) { after?.(); router.refresh(); }
    });

  return (
    <div className="space-y-6">
      <form
        className="rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => { e.preventDefault(); run(() => addWebLink(form) as never, "Web ditambahkan.", () => setForm({ name: "", url: "", description: "", mapel: "", kategori: KATEGORI[0], cover: "" })); }}
      >
        <h2 className="sm:col-span-2 font-bold text-gray-900 dark:text-white">Tambah web</h2>
        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Nama
          <input className={input} required maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="mis. Polypad" />
        </label>
        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Link
          <input className={input} required type="url" inputMode="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
        </label>
        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Mapel
          <input className={input} maxLength={40} value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} placeholder="mis. Matematika" />
        </label>
        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Kategori
          <select className={input} value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
            {KATEGORI.map((k) => <option key={k}>{k}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 sm:col-span-2">Link gambar cover (opsional, https://…)
          <input className={input} type="url" inputMode="url" value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} placeholder="Kosongkan untuk cover huruf otomatis" />
        </label>
        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 sm:col-span-2">Keterangan singkat
          <textarea className={input} rows={2} maxLength={240} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Untuk apa web ini dipakai di kelas?" />
        </label>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button disabled={pending} className="rounded-lg bg-nb-orange border-2 border-nb-ink px-4 py-2 font-bold text-nb-ink disabled:opacity-60 inline-flex items-center gap-2">
            <Icon name="plus" /> {pending ? "Menyimpan…" : "Tambah"}
          </button>
          {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-green-700 dark:text-green-400" : "text-red-600"}`}>{msg.text}</p>}
        </div>
      </form>

      <ul className="space-y-2">
        {links.length === 0 && <li className="text-sm text-gray-500">Belum ada web.</li>}
        {links.map((w, i) => (
          <li key={w.id} className="rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 flex items-center gap-3">
            <span className="w-7 text-center text-sm font-bold text-gray-500">{i + 1}</span>
            {w.cover ? <img src={w.cover} alt="" className="w-16 h-9 object-cover object-top rounded border border-gray-300 shrink-0" /> : null}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 dark:text-white truncate">{w.name} <span className="text-xs font-semibold text-gray-500">· {w.kategori}</span></p>
              <a href={w.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 underline truncate block">{hostOf(w.url)}</a>
            </div>
            <div className="flex gap-1 shrink-0">
              <button type="button" aria-label={`Naikkan ${w.name}`} disabled={pending || i === 0} onClick={() => run(() => moveWebLink(w.id, -1) as never, "Urutan diubah.")} className="w-9 h-9 rounded-lg border-2 border-gray-300 dark:border-slate-600 disabled:opacity-30">↑</button>
              <button type="button" aria-label={`Turunkan ${w.name}`} disabled={pending || i === links.length - 1} onClick={() => run(() => moveWebLink(w.id, 1) as never, "Urutan diubah.")} className="w-9 h-9 rounded-lg border-2 border-gray-300 dark:border-slate-600 disabled:opacity-30">↓</button>
              <button type="button" aria-label={`Hapus ${w.name}`} disabled={pending} onClick={() => { if (confirm(`Hapus "${w.name}"?`)) run(() => deleteWebLink(w.id) as never, "Web dihapus."); }} className="w-9 h-9 rounded-lg border-2 border-red-300 text-red-600 inline-flex items-center justify-center"><Icon name="trash" /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
