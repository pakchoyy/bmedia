"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUsulanDibaca, setUsulanTampil, deleteUsulan } from "@/app/admin/actions";
import Icon from "@/components/Icon";

export interface UsulanRow { id: string; nama: string; kontak: string; jenis: string; pesan: string; dibaca: boolean; created_at: string; rating: number | null; peran: string; tampil: boolean }

const WARNA: Record<string, string> = { Ulasan: "bg-nb-lilac", "Usulan game": "bg-nb-yellow", "Kendala / error": "bg-nb-pink", "Saran tampilan": "bg-nb-mint", Lainnya: "bg-gray-200" };

export default function UsulanList({ rows }: { rows: UsulanRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });
  if (!rows.length) return <p className="text-sm text-gray-500">Belum ada usulan.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((u) => (
        <li key={u.id} className={`rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 ${u.dibaca ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className={`rounded-full border-2 border-nb-ink px-2 py-0.5 text-nb-ink ${WARNA[u.jenis] ?? "bg-gray-200"}`}>{u.jenis}</span>
            {u.rating ? <span aria-label={`${u.rating} bintang`}>{"⭐".repeat(u.rating)}</span> : null}
            {u.tampil && <span className="rounded-full bg-nb-mint px-2 py-0.5 text-nb-ink">Tampil di beranda</span>}
            {!u.dibaca && <span className="rounded-full bg-nb-orange px-2 py-0.5 text-nb-ink">Baru</span>}
            <span className="text-gray-500">{new Date(u.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-gray-900 dark:text-white">{u.pesan}</p>
          <p className="mt-2 text-xs text-gray-600 dark:text-slate-400">
            {u.nama || "Tanpa nama"}{u.peran ? ` · ${u.peran}` : ""}{u.kontak ? ` · ${u.kontak}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {u.jenis === "Ulasan" && (
              <button type="button" disabled={pending} onClick={() => run(() => setUsulanTampil(u.id, !u.tampil))} className={`rounded-lg border-2 px-3 py-1.5 text-sm font-bold inline-flex items-center gap-1.5 ${u.tampil ? "border-gray-300 text-gray-700 dark:text-slate-200" : "border-nb-ink bg-nb-mint text-nb-ink"}`}>
                <Icon name="star" /> {u.tampil ? "Sembunyikan dari beranda" : "Tampilkan di beranda"}
              </button>
            )}
            <button type="button" disabled={pending} onClick={() => run(() => setUsulanDibaca(u.id, !u.dibaca))} className="rounded-lg border-2 border-gray-300 px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 inline-flex items-center gap-1.5">
              <Icon name="check" /> {u.dibaca ? "Tandai belum dibaca" : "Tandai dibaca"}
            </button>
            <button type="button" disabled={pending} aria-label="Hapus usulan" onClick={() => { if (confirm("Hapus usulan ini?")) run(() => deleteUsulan(u.id)); }} className="rounded-lg border-2 border-red-300 px-3 py-1.5 text-sm font-bold text-red-600 inline-flex items-center gap-1.5">
              <Icon name="trash" /> Hapus
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
