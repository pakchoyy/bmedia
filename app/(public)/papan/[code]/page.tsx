import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { sql } from "@/lib/db";
import { isValidCode, normalizeCode } from "@/lib/soal";
import { getGame } from "@/lib/games";
import AutoRefresh from "@/components/AutoRefresh";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Papan Peringkat Kelas", robots: { index: false } };

interface Row { name: string; best: number; main: number; benar: number }

const MEDALI = ["🥇", "🥈", "🥉"];
const WARNA = ["bg-nb-yellow", "bg-slate-200", "bg-nb-orange/60"];

export default async function PapanPage({ params }: { params: { code: string } }) {
  noStore();
  const code = normalizeCode(params.code);
  if (!isValidCode(code)) notFound();
  const sets = await sql`SELECT id, title, game FROM question_sets WHERE code = ${code} LIMIT 1`;
  const set = sets[0] as { id: string; title: string; game: string } | undefined;
  if (!set) notFound();
  const rows = (await sql`
    SELECT max(player_name) AS name, max(score)::int AS best, count(*)::int AS main, max(quiz_right)::int AS benar
    FROM play_results WHERE set_id = ${set.id}
    GROUP BY lower(player_name)
    ORDER BY best DESC, min(created_at) ASC
    LIMIT 30
  `) as Row[];
  const game = getGame(set.game);

  return (
    <div className="px-4 py-8">
      <AutoRefresh seconds={10} />
      <div className="container mx-auto max-w-[900px]">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Papan Peringkat · {game?.title ?? "Game"}</p>
          <h1 className="mt-1 font-display font-bold text-3xl sm:text-5xl text-nb-ink dark:text-white">{set.title}</h1>
          <p className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-nb-ink dark:text-white">
            Ikut main: buka <span className="nb-flat rounded-lg bg-white dark:bg-slate-800 px-2 py-0.5">main-yuk.my.id/main</span> lalu ketik kode
            <span className="nb-flat rounded-lg bg-nb-yellow px-2.5 py-0.5 font-display text-lg tracking-widest text-nb-ink">{code}</span>
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="nb rounded-2xl bg-white dark:bg-slate-900 mt-8 p-10 text-center text-slate-600 dark:text-slate-300">
            Belum ada yang main. Papan ini akan terisi otomatis.
          </div>
        ) : (
          <ol className="mt-8 space-y-2.5">
            {rows.map((r, i) => (
              <li key={r.name + i} className={`nb rounded-2xl flex items-center gap-3 sm:gap-4 px-4 py-3 ${i < 3 ? WARNA[i] : "bg-white dark:bg-slate-900"}`}>
                <span className="w-10 text-center font-display font-bold text-2xl text-nb-ink dark:text-white shrink-0">{MEDALI[i] ?? i + 1}</span>
                <span className={`flex-1 min-w-0 truncate font-display font-bold ${i < 3 ? "text-2xl text-nb-ink" : "text-xl text-nb-ink dark:text-white"}`}>{r.name}</span>
                <span className={`hidden sm:inline text-xs font-bold ${i < 3 ? "text-nb-ink/70" : "text-slate-500"}`}>{r.main}× main</span>
                <span className={`font-display font-bold text-2xl tabular-nums ${i < 3 ? "text-nb-ink" : "text-nb-orange"}`}>{r.best}</span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-6 text-center text-xs text-slate-500">Skor tertinggi tiap murid · diperbarui otomatis tiap 10 detik</p>
        <div className="mt-4 text-center">
          <Link href={`/main/${code}`} className="nb nb-hover nb-press inline-flex items-center gap-2 rounded-xl bg-nb-orange px-5 py-3 font-extrabold text-nb-ink">
            <Icon name="play" /> Main sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
