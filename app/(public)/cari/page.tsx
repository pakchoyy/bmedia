import type { Metadata } from "next";
import Link from "next/link";
import { search, type SearchResult } from "@/lib/search";
import { getSettings, coverKey, gameMeta } from "@/lib/settings";
import GameTile from "@/components/GameTile";
import GameCard from "@/components/GameCard";
import WebLuarCard from "@/components/WebLuarCard";
import SearchBox from "@/components/SearchBox";

export const metadata: Metadata = { title: "Cari" };
export const dynamic = "force-dynamic";

const JENIS = [
  { k: "", label: "Semua" },
  { k: "admin", label: "Karya Admin" },
  { k: "kontributor", label: "Kontributor" },
  { k: "web", label: "Web Lain" },
];


export default async function CariPage({ searchParams }: { searchParams: { q?: string; j?: string } }) {
  const q = (searchParams.q ?? "").trim().slice(0, 60);
  const j = JENIS.some((x) => x.k === searchParams.j) ? searchParams.j! : "";
  const [settings, r] = await Promise.all([getSettings(), q ? search(q) : Promise.resolve({ games: [], karya: [], webs: [] } as SearchResult)]);
  const { games, karya, webs } = r;
  const counts: Record<string, number> = { "": games.length + karya.length + webs.length, admin: games.length, kontributor: karya.length, web: webs.length };
  const show = (k: string) => !j || j === k;
  const href = (k: string) => `/cari?q=${encodeURIComponent(q)}${k ? `&j=${k}` : ""}`;

  return (
    <div className="fade-in px-4 py-8">
      <div className="container mx-auto max-w-[1200px]">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-nb-ink dark:text-white text-center">
          Cari di <span className="nb-mark">Main-yuk</span>
        </h1>
        <SearchBox defaultValue={q} className="mt-5 max-w-2xl mx-auto" autoFocus mode="page" />

        {q && (
          <>
            <nav aria-label="Jenis hasil" className="mt-5 flex flex-wrap justify-center gap-2">
              {JENIS.map((x) => (
                <Link key={x.k} href={href(x.k)} aria-current={j === x.k ? "page" : undefined}
                  className={`nb-sm nb-press rounded-full px-3.5 py-1.5 text-sm font-extrabold ${j === x.k ? "bg-nb-yellow text-nb-ink" : "bg-white dark:bg-slate-900 text-nb-ink dark:text-white"}`}>
                  {x.label} <span className="opacity-60">{counts[x.k]}</span>
                </Link>
              ))}
            </nav>

            {counts[""] === 0 && (
              <div className="mt-10 text-center">
                <p className="text-slate-700 dark:text-slate-300">Tidak ada hasil untuk “<b>{q}</b>”. Coba kata lain, misalnya <i>matematika</i>, <i>IPA</i>, atau <i>kuis</i>.</p>
                <Link href={`/usulan`} className="mt-4 inline-block nb-sm nb-press rounded-xl bg-nb-mint px-4 py-2 font-extrabold text-nb-ink">Usulkan game “{q}”</Link>
              </div>
            )}

            {show("admin") && games.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display font-bold text-2xl text-nb-ink dark:text-white mb-4">Karya Admin Main-yuk</h2>
                <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
                  {games.map((g) => <GameTile key={g.slug} game={g} cover={settings[coverKey(g.slug)]} meta={gameMeta(settings, g)} />)}
                </div>
              </section>
            )}
            {show("kontributor") && karya.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display font-bold text-2xl text-nb-ink dark:text-white mb-4">Karya Kontributor</h2>
                <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
                  {karya.slice(0, 40).map((m) => <GameCard key={m.id} media={m} />)}
                </div>
              </section>
            )}
            {show("web") && webs.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display font-bold text-2xl text-nb-ink dark:text-white mb-4">Web Belajar Lain</h2>
                <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
                  {webs.map((w, i) => <WebLuarCard key={w.id} w={w} i={i} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
