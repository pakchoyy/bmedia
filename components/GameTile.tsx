"use client";

import Link from "next/link";
import { useEffect } from "react";
import Icon from "./Icon";
import DetailSheet, { useDetailSheet } from "./DetailSheet";
import type { GameInfo } from "@/lib/games";
import type { GameMeta } from "@/lib/settings";

/** Lencana cara main & perangkat. */
export function gameBadges(game: GameInfo): string[] {
  const b: string[] = [];
  if (game.cara?.includes("ifp")) b.push("📺 Layar kelas");
  if (game.perlu === "keyboard") b.push("💻 Laptop saja");
  return b;
}

/** Kartu game Karya Admin. Ketuk kartu = panel detail di tempat; tombol Main langsung ke game. */
export default function GameTile({ game, cover, meta, plays }: { game: GameInfo; cover?: string; meta?: GameMeta; plays?: number }) {
  const custom = !game.noSet;
  const m = meta ?? { mapel: game.mapel, fase: game.fase, deskripsi: game.tagline };
  const sheet = useDetailSheet();
  const badges = gameBadges(game);
  const img = cover || game.preview;
  const openSheet = (noPush?: boolean) => sheet.open({
    key: game.slug, title: game.title,
    // eslint-disable-next-line @next/next/no-img-element
    cover: <img src={img} alt="" className="w-full h-full object-cover" />,
    badges: [m.mapel, m.fase, ...(game.cara?.includes("online") ? ["👥 Mabar"] : []), ...badges], desc: m.deskripsi, steps: game.caraMain,
    meta: plays ? `🎮 ${plays.toLocaleString("id-ID")}× dimainkan` : "🎮 Baru",
    actions: [
      { label: "▶ Main sekarang", href: `/game/${game.slug}`, tone: "main" },
      ...(custom ? [{ label: "✏️ Pakai soal sendiri", href: `/guru/baru?game=${game.slug}` }] : []),
    ],
  }, noPush === true);
  // dibuka dari tautan /?lihat=slug (mis. tombol Kembali dari game)
  useEffect(() => { if (new URLSearchParams(location.search).get('lihat') === game.slug) { openSheet(true); document.getElementById('game')?.scrollIntoView(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <article className="group nb nb-hover bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
      <button type="button" onClick={() => openSheet()} className="block w-full border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)]" aria-label={`Lihat detail ${game.title}`}>
        <div className="relative aspect-video overflow-hidden bg-nb-cream">
          {game.cara?.includes("online") && <span className="absolute top-2 right-2 z-10 rounded-full border-2 border-nb-ink bg-nb-pink text-white px-2.5 py-0.5 text-[11px] sm:text-xs font-extrabold shadow-[2px_2px_0_#1b1a3a]">👥 Mabar</span>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        </div>
      </button>
      <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <h3 className="font-display font-bold text-[15px] sm:text-xl text-nb-ink dark:text-white leading-tight">
          <button type="button" onClick={() => openSheet()} className="text-left hover:underline decoration-nb-yellow decoration-4 underline-offset-4">{game.title}</button>
        </h3>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-md border-2 border-nb-ink bg-nb-yellow px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-nb-ink">{m.mapel}</span>
          <span className="rounded-md border-2 border-nb-ink bg-[#c4a8ff] px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-nb-ink">{m.fase}</span>
          {badges.map((b) => { const [ic, ...t] = b.split(" "); return <span key={b} title={t.join(" ")} className="rounded-md border-2 border-nb-ink bg-white dark:bg-slate-800 dark:text-white px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-nb-ink">{ic}<span className="hidden sm:inline"> {t.join(" ")}</span><span className="sr-only sm:hidden"> {t.join(" ")}</span></span>; })}
        </div>
        <p className="text-xs sm:text-sm leading-snug text-slate-700 dark:text-slate-300 line-clamp-2">{m.deskripsi}</p>
        <p className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-400">🎮 {plays ? `${plays.toLocaleString("id-ID")}× dimainkan` : "Baru"}</p>
        <div className={`mt-auto pt-1 grid gap-1.5 ${custom ? "grid-cols-[1fr_auto]" : "grid-cols-1"}`}>
          <Link href={`/game/${game.slug}`} className="nb-press inline-flex items-center justify-center gap-1.5 rounded-xl bg-nb-yellow hover:brightness-105 hover:-translate-y-0.5 transition border-2 border-nb-ink shadow-[2px_2px_0_#1b1a3a] min-h-[44px] text-sm sm:text-base font-extrabold text-nb-ink">
            <Icon name="play" /> Main
          </Link>
          {custom && (
            <Link href={`/guru/baru?game=${game.slug}`} className="nb-press inline-flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 dark:text-white hover:bg-nb-cream hover:-translate-y-0.5 transition border-2 border-nb-ink shadow-[2px_2px_0_#1b1a3a] min-h-[44px] min-w-[44px] px-2.5 sm:px-3 text-sm font-extrabold text-nb-ink" title={`Buat soal sendiri untuk ${game.title}`} aria-label={`Pakai soal sendiri untuk ${game.title}`}>
              <Icon name="pen" /> <span className="hidden sm:inline">Soal</span>
            </Link>
          )}
        </div>
      </div>
      <DetailSheet data={sheet.data} onClose={sheet.close} />
    </article>
  );
}
