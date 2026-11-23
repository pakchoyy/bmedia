"use client";

import { useState } from "react";
import Link from "next/link";
import type { Ulasan } from "@/lib/queries";

/** Ulasan pengguna berjalan dari kanan ke kiri. Bisa dijeda (tombol, hover, atau fokus keyboard). */
export default function UlasanMarquee({ items }: { items: Ulasan[] }) {
  const [paused, setPaused] = useState(false);

  if (!items.length) {
    return (
      <div className="border-y-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-yellow px-4 py-3 text-center">
        <p className="font-extrabold text-nb-ink">
          Sudah coba Main-yuk di kelas? <Link href="/usulan?jenis=Ulasan" className="underline decoration-2 underline-offset-4">Tulis ulasan pertamamu ⭐</Link>
        </p>
      </div>
    );
  }

  // Gandakan isi sampai cukup panjang agar putaran mulus
  const base = items.length < 4 ? [...items, ...items, ...items] : items;
  const loop = [...base, ...base];
  const dur = Math.max(30, base.length * 9);

  return (
    <div className="relative border-y-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-yellow py-3" aria-label="Ulasan pengguna Main-yuk">
      <div className="overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <ul className="ulasan-track flex w-max gap-3 px-3" style={{ animationDuration: `${dur}s`, animationPlayState: paused ? "paused" : "running" }}>
          {loop.map((u, i) => (
            <li key={i} aria-hidden={i >= base.length ? true : undefined}
              className="w-[260px] sm:w-[320px] shrink-0 rounded-2xl bg-white border-[3px] border-nb-ink shadow-[3px_3px_0_#1b1a3a] px-4 py-3">
              <p className="text-sm" aria-label={`${u.rating} dari 5 bintang`}>{"⭐".repeat(u.rating)}</p>
              <p className="mt-1 text-sm font-semibold text-nb-ink line-clamp-3">“{u.pesan}”</p>
              <p className="mt-1.5 text-xs font-extrabold text-slate-600 truncate">{u.nama || "Pengguna Main-yuk"}{u.peran ? ` · ${u.peran}` : ""}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 flex items-center justify-center gap-3 text-xs font-extrabold text-nb-ink">
        <button type="button" onClick={() => setPaused((p) => !p)} className="rounded-full bg-white border-2 border-nb-ink px-2.5 py-0.5" aria-pressed={paused}>
          {paused ? "▶ Jalankan" : "⏸ Jeda"}
        </button>
        <Link href="/usulan?jenis=Ulasan" className="underline decoration-2 underline-offset-4">Tulis ulasanmu</Link>
      </div>
    </div>
  );
}
