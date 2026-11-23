"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";

interface Item { href: string; title: string; sub: string; img?: string | null; ext?: boolean }
interface Res { total: number; games: Item[]; karya: Item[]; webs: Item[] }

/**
 * Kotak cari live.
 * - mode "dropdown" (beranda): hasil muncul di bawah kotak saat mengetik.
 * - mode "page" (/cari): memperbarui URL ?q= tanpa memuat ulang halaman sehingga hasil server ikut berganti.
 */
export default function SearchBox({ defaultValue = "", className = "", autoFocus = false, mode = "dropdown" }: { defaultValue?: string; className?: string; autoFocus?: boolean; mode?: "dropdown" | "page" }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [res, setRes] = useState<Res | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    const v = q.trim();
    const t = setTimeout(async () => {
      if (mode === "page") {
        router.replace(v ? `/cari?q=${encodeURIComponent(v)}` : "/cari", { scroll: false });
        return;
      }
      if (v.length < 2) { setRes(null); return; }
      const my = ++seq.current; setBusy(true);
      try {
        const r = await fetch(`/api/cari?q=${encodeURIComponent(v)}`);
        const d = (await r.json()) as Res;
        if (my === seq.current) { setRes(d); setOpen(true); }
      } catch { /* abaikan */ } finally { if (my === seq.current) setBusy(false); }
    }, mode === "page" ? 250 : 200);
    return () => clearTimeout(t);
  }, [q, mode, router]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const group = (label: string, items: Item[]) => items.length > 0 && (
    <div className="py-1.5">
      <p className="px-3 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{label}</p>
      {items.map((it) => (
        <a key={it.href} href={it.href} target={it.ext ? "_blank" : undefined} rel={it.ext ? "noopener noreferrer" : undefined}
          className="flex items-center gap-3 px-3 py-2 hover:bg-nb-cream dark:hover:bg-slate-800 focus:bg-nb-cream focus:outline-none">
          {it.img
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={it.img} alt="" className="w-14 h-9 rounded-md object-cover border-2 border-nb-ink shrink-0" />
            : <span className="w-14 h-9 rounded-md bg-nb-yellow border-2 border-nb-ink shrink-0" />}
          <span className="min-w-0 text-left">
            <span className="block truncate font-bold text-nb-ink dark:text-white">{it.title}</span>
            <span className="block truncate text-xs text-slate-500">{it.sub}{it.ext ? " ↗" : ""}</span>
          </span>
        </a>
      ))}
    </div>
  );

  return (
    <div ref={box} className={`relative ${className}`}>
      <form action="/cari" method="get" role="search" onSubmit={(e) => { if (mode === "page") e.preventDefault(); }}>
        <label htmlFor={`cari-${mode}`} className="sr-only">Cari game, karya, atau web belajar</label>
        <Icon name="magnifying-glass" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input id={`cari-${mode}`} name="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => res && setOpen(true)}
          autoFocus={autoFocus} maxLength={60} autoComplete="off" placeholder="Cari game, mapel, atau nama guru…"
          aria-expanded={mode === "dropdown" ? open : undefined} aria-controls={mode === "dropdown" ? "cari-hasil" : undefined}
          className="w-full nb rounded-2xl bg-white dark:bg-slate-900 pl-11 pr-12 py-3.5 font-semibold text-nb-ink dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-nb-yellow" />
        {busy && <span className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-nb-ink border-t-transparent animate-spin" aria-hidden="true" />}
      </form>
      {mode === "dropdown" && open && res && q.trim().length >= 2 && (
        <div id="cari-hasil" className="absolute z-40 left-0 right-0 mt-2 nb rounded-2xl bg-white dark:bg-slate-900 overflow-hidden text-left max-h-[60vh] overflow-y-auto">
          {res.total === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-600">Tidak ada hasil untuk “{q}”. <a href="/usulan" className="font-bold underline">Usulkan game ini</a></p>
          ) : (
            <>
              {group("Karya Admin", res.games)}
              {group("Karya Kontributor", res.karya)}
              {group("Web Belajar Lain", res.webs)}
              <a href={`/cari?q=${encodeURIComponent(q.trim())}`} className="block border-t-2 border-nb-ink bg-nb-yellow px-4 py-2.5 text-sm font-extrabold text-nb-ink text-center">Lihat semua {res.total} hasil →</a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
