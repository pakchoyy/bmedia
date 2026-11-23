import Link from "next/link";
import Icon from "./Icon";
import type { GameInfo } from "@/lib/games";

/** Kartu game Karya Admin. Game yang mendukung soal guru diberi pita "Bisa Custom Soal" + tombol ke Ruang Guru. */
export default function GameTile({ game, cover }: { game: GameInfo; cover?: string }) {
  const custom = !game.noSet;
  return (
    <article className="group nb nb-hover bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
      <Link href={`/game/${game.slug}`} className="block" tabIndex={-1} aria-hidden="true">
        <div className="aspect-video overflow-hidden bg-nb-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover || game.preview} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        </div>
      </Link>
      <div className={`border-y-[3px] border-nb-ink dark:border-[var(--nb-ink)] px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-nb-ink ${custom ? "bg-nb-pink" : "bg-nb-cream"}`}>
        {custom ? <>✏️ <span className="hidden sm:inline">Bisa </span>custom soal</> : "🎯 Soal bawaan"}
      </div>
      <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <h3 className="font-display font-bold text-[15px] sm:text-xl text-nb-ink dark:text-white leading-tight">
          <Link href={`/game/${game.slug}`} className="hover:underline decoration-nb-yellow decoration-4 underline-offset-4">{game.title}</Link>
        </h3>
        <p className="hidden sm:block text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{game.tagline}</p>
        <p className="sm:hidden text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">{game.modes[0]}</p>
        <div className={`mt-auto pt-1 grid gap-1.5 ${custom ? "grid-cols-[1fr_auto] sm:grid-cols-2" : "grid-cols-1"}`}>
          <Link href={`/game/${game.slug}`} className="nb-press inline-flex items-center justify-center gap-1.5 rounded-xl bg-nb-orange border-2 border-nb-ink py-1.5 sm:py-2 text-[13px] sm:text-sm font-extrabold text-nb-ink">
            <Icon name="play" /> Main
          </Link>
          {custom && (
            <Link href="/guru" className="nb-press inline-flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-nb-ink px-2.5 sm:px-0 py-1.5 sm:py-2 text-sm font-extrabold text-nb-ink dark:text-white" title="Buat atau unggah soal sendiri di Ruang Guru" aria-label={`Pakai soal sendiri untuk ${game.title}`}>
              <Icon name="pen" /> <span className="hidden sm:inline">Soal sendiri</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
