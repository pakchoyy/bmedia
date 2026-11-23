import Link from "next/link";
import Icon from "./Icon";
import type { GameInfo } from "@/lib/games";

export default function GameTile({ game }: { game: GameInfo }) {
  return (
    <Link href={`/game/${game.slug}`} className="group nb nb-hover nb-press bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
      <div className="relative aspect-video overflow-hidden border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-cream">
        <img src={game.preview} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        <span className="absolute top-2 left-2 nb-flat rounded-full bg-nb-yellow text-nb-ink px-2.5 py-0.5 text-[11px] font-extrabold">Main-yuk</span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display font-bold text-xl text-nb-ink dark:text-white leading-tight">{game.title}</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 flex-1">{game.tagline}</p>
        <div className="flex flex-wrap gap-1.5">
          {game.modes.slice(0, 3).map((m) => (
            <span key={m} className="nb-flat rounded-full bg-nb-mint/25 px-2 py-0.5 text-[11px] font-bold text-nb-ink dark:text-white">{m}</span>
          ))}
        </div>
        <span className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-nb-orange border-2 border-nb-ink py-2 font-extrabold text-nb-ink">
          <Icon name="play" /> Main
        </span>
      </div>
    </Link>
  );
}
