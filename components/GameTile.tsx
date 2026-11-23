import Link from "next/link";
import Icon from "./Icon";
import type { GameInfo } from "@/lib/games";
import type { GameMeta } from "@/lib/settings";

/** Kartu game Karya Admin: cover, badge mapel & fase, tombol Main (hijau) dan Soal sendiri (biru, hanya game yang mendukung soal guru). */
export default function GameTile({ game, cover, meta }: { game: GameInfo; cover?: string; meta?: GameMeta }) {
  const custom = !game.noSet;
  const m = meta ?? { mapel: game.mapel, fase: game.fase, deskripsi: game.tagline };
  return (
    <article className="group nb nb-hover bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
      <Link href={`/permainan/${game.slug}`} className="block border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)]" tabIndex={-1} aria-hidden="true">
        <div className="aspect-video overflow-hidden bg-nb-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover || game.preview} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        </div>
      </Link>
      <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <h3 className="font-display font-bold text-[15px] sm:text-xl text-nb-ink dark:text-white leading-tight">
          <Link href={`/permainan/${game.slug}`} className="hover:underline decoration-nb-yellow decoration-4 underline-offset-4">{game.title}</Link>
        </h3>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-md border-2 border-nb-ink bg-nb-yellow/50 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-nb-ink dark:text-white">{m.mapel}</span>
          <span className="rounded-md border-2 border-nb-ink bg-nb-lilac/40 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-nb-ink dark:text-white">{m.fase}</span>
        </div>
        <p className="hidden sm:block text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{m.deskripsi}</p>
        <div className={`mt-auto pt-1 grid gap-1.5 ${custom ? "grid-cols-[1fr_auto] sm:grid-cols-2" : "grid-cols-1"}`}>
          <Link href={`/game/${game.slug}`} className="nb-press inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5fd068] border-2 border-nb-ink shadow-[2px_2px_0_#1b1a3a] py-1.5 sm:py-2 text-[13px] sm:text-sm font-extrabold text-nb-ink">
            <Icon name="play" /> Main
          </Link>
          {custom && (
            <Link href={`/guru/baru?game=${game.slug}`} className="nb-press inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#6cb8ff] border-2 border-nb-ink shadow-[2px_2px_0_#1b1a3a] px-2.5 sm:px-0 py-1.5 sm:py-2 text-sm font-extrabold text-nb-ink" title={`Buat soal sendiri untuk ${game.title}`} aria-label={`Pakai soal sendiri untuk ${game.title}`}>
              <Icon name="pen" /> <span className="hidden sm:inline">Soal sendiri</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
