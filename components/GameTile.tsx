import Link from "next/link";
import Icon from "./Icon";
import type { GameInfo } from "@/lib/games";

/** Kartu game Karya Admin. Di HP tampil 2 kolom (ringkas), di layar besar lebih lengkap. */
export default function GameTile({ game, cover }: { game: GameInfo; cover?: string }) {
  return (
    <Link href={`/game/${game.slug}`} className="group nb nb-hover nb-press bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
      <div className="relative aspect-video overflow-hidden border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover || game.preview} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        {!game.noSet && (
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 nb-flat rounded-full bg-nb-mint text-nb-ink px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold inline-flex items-center gap-1">
            <Icon name="pen" className="text-[9px]" /> Custom Soal
          </span>
        )}
      </div>
      <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <h3 className="font-display font-bold text-[15px] sm:text-xl text-nb-ink dark:text-white leading-tight">{game.title}</h3>
        <p className="hidden sm:block text-sm text-slate-700 dark:text-slate-300 line-clamp-2 flex-1">{game.tagline}</p>
        <div className="hidden sm:flex flex-wrap gap-1.5">
          {game.modes.slice(0, 3).map((m) => (
            <span key={m} className="nb-flat rounded-full bg-nb-yellow/40 px-2 py-0.5 text-[11px] font-bold text-nb-ink dark:text-white">{m}</span>
          ))}
        </div>
        <p className="sm:hidden text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1 flex-1">{game.modes[0]}</p>
        <span className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-nb-orange border-2 border-nb-ink py-1.5 sm:py-2 text-sm sm:text-base font-extrabold text-nb-ink">
          <Icon name="play" /> Main
        </span>
      </div>
    </Link>
  );
}
