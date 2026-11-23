"use client";

import { useState } from "react";
import Link from "next/link";
import type { Ulasan } from "@/lib/queries";

/** Ulasan pengguna berjalan dari kanan ke kiri. Bisa dijeda (tombol, hover, atau fokus keyboard). */
export default function UlasanMarquee({ items }: { items: Ulasan[] }) {
  const [paused, setPaused] = useState(false);

  const head = (
    <div className="container mx-auto max-w-[1200px] px-4 flex items-end justify-between gap-3 mb-3">
      <h2 className="font-display font-bold text-xl sm:text-2xl text-nb-ink">⭐ Kata Pengguna</h2>
      <Link href="/usulan?jenis=Ulasan" className="shrink-0 rounded-xl bg-white border-2 border-nb-ink shadow-[2px_2px_0_#1b1a3a] px-3 py-1.5 text-sm font-extrabold text-nb-ink">⭐ Tulis ulasan</Link>
    </div>
  );

  if (!items.length) {
    return (
      <div className="border-y-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-yellow py-5">
        {head}
        <div className="container mx-auto max-w-[1200px] px-4">
          <Link href="/usulan?jenis=Ulasan" className="group block rounded-2xl bg-white border-[3px] border-nb-ink shadow-[4px_4px_0_#1b1a3a] p-4 sm:p-5 sm:flex sm:items-center sm:gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/maskot/jempol.webp" alt="" aria-hidden="true" className="w-20 sm:w-24 shrink-0 max-sm:float-right" />
            <span className="block mt-1 sm:mt-0">
              <span className="block font-display font-bold text-lg text-nb-ink">Belum ada ulasan. Jadi yang pertama!</span>
              <span className="block text-sm text-slate-600">Ceritakan pengalaman main Main-yuk di kelas atau di rumah. Ulasan pilihan tampil di sini.</span>
            </span>
            <span className="hidden sm:inline ml-auto font-extrabold text-nb-ink group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  // Gandakan isi sampai cukup panjang agar putaran mulus
  const base = items.length < 4 ? [...items, ...items, ...items] : items;
  const loop = [...base, ...base];
  const dur = Math.max(30, base.length * 9);

  return (
    <div className="relative border-y-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-yellow py-5" aria-label="Ulasan pengguna Main-yuk">
      {head}
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
      </div>
    </div>
  );
}
