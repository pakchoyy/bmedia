import Link from "next/link";
import Icon from "./Icon";
import type { GameInfo } from "@/lib/games";

/** Kartu besar satu game: pratinjau, mode, dan tombol main / pakai soal sendiri. */
export default function GameShowcase({ game, compact = false }: { game: GameInfo; compact?: boolean }) {
  return (
    <article className="nb rounded-2xl bg-white dark:bg-slate-900 overflow-hidden grid md:grid-cols-[1.1fr_1fr]">
      <div className="relative border-b-[3px] md:border-b-0 md:border-r-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-mint/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={game.preview} alt={`Cuplikan permainan ${game.title}`} width={960} height={540}
          className="w-full h-full object-cover aspect-video" loading="lazy" />
        <span className="nb-sm absolute left-3 top-3 rounded-full bg-nb-yellow text-nb-ink px-3 py-1 text-xs font-extrabold">
          Game Unggulan
        </span>
      </div>

      <div className="p-5 sm:p-6 flex flex-col">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-nb-ink dark:text-white">{game.title}</h2>
        <p className="mt-2 text-slate-700 dark:text-slate-300">{game.tagline}</p>

        <div className="flex flex-wrap gap-2 mt-3">
          {game.modes.map((m) => (
            <span key={m} className="nb-flat rounded-full bg-nb-yellow/40 px-2.5 py-1 text-xs font-bold text-nb-ink dark:text-white">{m}</span>
          ))}
        </div>

        {!compact && (
          <ol className="mt-4 space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
            <li>Guru membuat soal di <b>Ruang Guru</b> (ketik, impor Word, atau CSV).</li>
            <li>Guru membagikan <b>kode kelas</b> atau QR.</li>
            <li>Murid masuk lewat <b>Masuk Kelas</b> dan bermain dengan soal tersebut.</li>
          </ol>
        )}

        <div className="mt-auto pt-5 flex flex-wrap gap-3">
          <Link href={`/game/${game.slug}`} className="nb nb-hover nb-press bg-nb-orange text-nb-ink font-extrabold rounded-xl px-5 py-3 inline-flex items-center gap-2">
            <Icon name="play" /> Main Sekarang
          </Link>
          <Link href="/guru" className="nb-sm nb-hover nb-press bg-nb-yellow text-nb-ink font-extrabold rounded-xl px-4 py-3 inline-flex items-center gap-2">
            <Icon name="chalkboard-user" /> Pakai Soal Sendiri
          </Link>
        </div>
      </div>
    </article>
  );
}
