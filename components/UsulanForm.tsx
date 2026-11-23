"use client";

import { useState } from "react";

const JENIS = ["Ulasan", "Usulan game", "Kendala / error", "Saran tampilan", "Lainnya"];
const PERAN = ["Guru", "Murid", "Orang tua", "Lainnya"];
const field = "w-full rounded-xl border-[3px] border-nb-ink bg-white dark:bg-slate-900 px-3 py-2.5 text-nb-ink dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-nb-yellow";

export default function UsulanForm({ awal = "Ulasan" }: { awal?: string }) {
  const [f, setF] = useState({ nama: "", kontak: "", jenis: JENIS.includes(awal) ? awal : JENIS[0], pesan: "", website: "", rating: 0, peran: "Guru" });
  const [state, setState] = useState<"idle" | "kirim" | "ok">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setState("kirim");
    try {
      const r = await fetch("/api/usulan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Gagal mengirim.");
      setState("ok");
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : "Gagal mengirim."); setState("idle"); }
  }

  if (state === "ok") {
    return (
      <div className="nb rounded-2xl bg-nb-mint/30 p-6 text-center" role="status">
        <div className="text-5xl" aria-hidden="true">💌</div>
        <p className="mt-2 font-display font-bold text-2xl text-nb-ink dark:text-white">Terima kasih!</p>
        <p className="mt-1 text-slate-700 dark:text-slate-300">{f.jenis === "Ulasan" ? "Ulasanmu sudah sampai. Setelah dibaca Pak Choy, ulasan bisa tampil di beranda." : "Pesanmu sudah sampai ke Pak Choy."}</p>
        <button onClick={() => { setF({ ...f, pesan: "" }); setState("idle"); }} className="mt-4 nb-sm nb-press rounded-xl bg-white px-4 py-2 font-extrabold text-nb-ink">Kirim lagi</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="nb rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 grid gap-4">
      <fieldset>
        <legend className="text-sm font-extrabold text-nb-ink dark:text-white mb-2">Jenis</legend>
        <div className="flex flex-wrap gap-2">
          {JENIS.map((j) => (
            <label key={j} className={`cursor-pointer nb-sm rounded-full px-3.5 py-1.5 text-sm font-extrabold ${f.jenis === j ? "bg-nb-yellow text-nb-ink" : "bg-white dark:bg-slate-800 text-nb-ink dark:text-white"}`}>
              <input type="radio" name="jenis" value={j} checked={f.jenis === j} onChange={() => setF({ ...f, jenis: j })} className="sr-only" />{j}
            </label>
          ))}
        </div>
      </fieldset>
      {f.jenis === "Ulasan" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <fieldset>
            <legend className="text-sm font-extrabold text-nb-ink dark:text-white mb-1.5">Nilai</legend>
            <div className="flex gap-1" role="radiogroup" aria-label="Jumlah bintang">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={f.rating === n} aria-label={`${n} bintang`}
                  onClick={() => setF({ ...f, rating: n })}
                  className={`text-3xl leading-none transition-transform hover:scale-110 ${n <= f.rating ? "" : "grayscale opacity-30"}`}>⭐</button>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-1.5 text-sm font-extrabold text-nb-ink dark:text-white">Saya seorang
            <select className={field} value={f.peran} onChange={(e) => setF({ ...f, peran: e.target.value })}>
              {PERAN.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>
      )}
      <label className="grid gap-1.5 text-sm font-extrabold text-nb-ink dark:text-white">{f.jenis === "Ulasan" ? "Ceritakan pengalamanmu" : "Pesan"}
        <textarea required minLength={5} maxLength={2000} rows={5} className={field} value={f.pesan} onChange={(e) => setF({ ...f, pesan: e.target.value })}
          placeholder={f.jenis === "Ulasan" ? "Contoh: Murid kelas 4 jadi semangat latihan perkalian pakai Balon Pecah di IFP." : "Contoh: Tolong buatkan game tebak gambar untuk IPA kelas 4. / Di HP saya tombol Mulai tidak bisa diklik."} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-extrabold text-nb-ink dark:text-white">Nama <span className="font-semibold text-slate-500">(opsional)</span>
          <input maxLength={60} className={field} value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} autoComplete="name" />
        </label>
        <label className="grid gap-1.5 text-sm font-extrabold text-nb-ink dark:text-white">No. WA / email <span className="font-semibold text-slate-500">(opsional, jika ingin dibalas)</span>
          <input maxLength={80} className={field} value={f.kontak} onChange={(e) => setF({ ...f, kontak: e.target.value })} />
        </label>
      </div>
      <input tabIndex={-1} aria-hidden="true" autoComplete="off" className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} name="website" />
      {err && <p role="alert" className="text-sm font-bold text-red-600">{err}</p>}
      <button disabled={state === "kirim"} className="nb nb-hover nb-press rounded-xl bg-nb-orange py-3 font-extrabold text-nb-ink disabled:opacity-60">
        {state === "kirim" ? "Mengirim…" : f.jenis === "Ulasan" ? "Kirim ulasan" : "Kirim"}
      </button>
    </form>
  );
}
