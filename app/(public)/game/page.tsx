import type { Metadata } from "next";
import Link from "next/link";
import GameShowcase from "@/components/GameShowcase";
import { MAIN_GAMES } from "@/lib/games";
import { getSettings, coverKey } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Karya Admin Main-yuk",
  description: "Game edukasi Main-yuk yang bisa memakai soal buatan guru sendiri.",
};

export const dynamic = "force-dynamic";

export default async function GameIndexPage() {
  const s = await getSettings();
  return (
    <div className="fade-in pb-10">
      <div className="bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] py-10 text-center px-4">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-nb-ink dark:text-white">
          Karya Admin <span className="nb-mark">Main</span><span className="text-nb-orange">-yuk</span>
        </h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
          Game seru yang soalnya bisa kamu buat sendiri. Cocok untuk latihan di kelas maupun di rumah.
        </p>
      </div>

      <div className="container mx-auto max-w-[1100px] px-4 py-8 space-y-6">
        {MAIN_GAMES.map((g) => (
          <GameShowcase key={g.slug} game={{ ...g, preview: s[coverKey(g.slug)] || g.preview }} />
        ))}

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Punya kode dari guru? <Link href="/main" className="font-extrabold underline decoration-nb-yellow decoration-4 underline-offset-4 text-nb-ink dark:text-white">Mabar Yuk</Link>
          {" · "}
          Game lain menyusul.
        </p>
      </div>
    </div>
  );
}
