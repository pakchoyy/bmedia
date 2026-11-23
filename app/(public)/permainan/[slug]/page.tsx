import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGame, variantsOf, MAIN_GAMES } from "@/lib/games";
import { getSettings, coverKey, gameMeta } from "@/lib/settings";
import GameTile from "@/components/GameTile";
import { getGamePlays } from "@/lib/queries";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGame(params.slug);
  if (!g) return { title: "Game tidak ditemukan" };
  return { title: g.title, description: g.tagline, openGraph: { images: [g.preview] } };
}

export default async function PermainanPage({ params }: { params: { slug: string } }) {
  const g = getGame(params.slug);
  if (!g || g.parent) notFound();
  const [s, plays] = await Promise.all([getSettings(), getGamePlays()]);
  const meta = gameMeta(s, g);
  const cover = s[coverKey(g.slug)] || g.preview;
  const custom = !g.noSet;
  const lain = MAIN_GAMES.filter((x) => x.slug !== g.slug).slice(0, 3);

  return (
    <div className="fade-in px-4 py-6 sm:py-10">
      <div className="container mx-auto max-w-[1100px]">
        <nav aria-label="Jejak" className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">
          <Link href="/" className="underline">Home</Link> / <Link href="/game" className="underline">Karya Admin</Link> / <span className="text-nb-ink dark:text-white">{g.title}</span>
        </nav>
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] items-start">
          <div className="nb rounded-2xl overflow-hidden bg-nb-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={`Cuplikan ${g.title}`} className="w-full aspect-video object-cover" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-nb-ink dark:text-white">{g.title}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-md border-2 border-nb-ink bg-nb-yellow/50 px-2 py-0.5 text-xs font-extrabold text-nb-ink dark:text-white">{meta.mapel}</span>
              <span className="rounded-md border-2 border-nb-ink bg-nb-lilac/40 px-2 py-0.5 text-xs font-extrabold text-nb-ink dark:text-white">{meta.fase}</span>
              {custom && <span className="rounded-md border-2 border-nb-ink bg-[#38a3ff] hover:bg-[#55b3ff] hover:-translate-y-0.5 transition/60 px-2 py-0.5 text-xs font-extrabold text-nb-ink dark:text-white">✏️ Bisa soal sendiri</span>}
            </div>
            <p className="mt-3 text-slate-700 dark:text-slate-300">{meta.deskripsi}</p>
            <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-400">🎮 {plays[g.slug] ? `${plays[g.slug].toLocaleString("id-ID")}× dimainkan` : "Game baru"}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {g.modes.map((m) => <span key={m} className="rounded-full border-2 border-nb-ink bg-white dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-nb-ink dark:text-white">{m}</span>)}
            </div>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <Link href={`/game/${g.slug}`} className="nb nb-hover nb-press inline-flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#2bd968] hover:-translate-y-0.5 transition py-3 font-extrabold text-nb-ink">
                <Icon name="play" /> Main sekarang
              </Link>
              {custom && (
                <Link href={`/guru/baru?game=${g.slug}`} className="nb nb-hover nb-press inline-flex items-center justify-center gap-2 rounded-xl bg-[#38a3ff] hover:bg-[#55b3ff] hover:-translate-y-0.5 transition py-3 font-extrabold text-nb-ink">
                  <Icon name="pen" /> Pakai soal sendiri
                </Link>
              )}
              {variantsOf(g.slug).map((v) => (
                <Link key={v.slug} href={`/game/${v.slug}`} className="nb-sm nb-press inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 py-3 font-extrabold text-nb-ink dark:text-white sm:col-span-2">
                  <Icon name="users" /> {v.label ?? v.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-8 nb rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6" aria-labelledby="cara">
          <h2 id="cara" className="font-display font-bold text-2xl text-nb-ink dark:text-white">Cara main</h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-3">
            {g.caraMain.map((c, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-nb-cream dark:bg-slate-800 border-2 border-nb-ink p-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-nb-orange border-2 border-nb-ink flex items-center justify-center font-display font-bold text-nb-ink">{i + 1}</span>
                <span className="text-sm text-slate-800 dark:text-slate-200">{c}</span>
              </li>
            ))}
          </ol>
          {custom && (
            <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
              <b>Untuk guru:</b> buat soal di Ruang Guru (ketik, tempel, atau unggah Word/CSV), bagikan kode ke murid, lalu pantau hasil dan papan peringkat kelas.
            </p>
          )}
        </section>

        <section className="mt-10" aria-labelledby="lain">
          <h2 id="lain" className="font-display font-bold text-2xl text-nb-ink dark:text-white mb-4">Game lainnya</h2>
          <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
            {lain.map((x) => <GameTile key={x.slug} game={x} cover={s[coverKey(x.slug)]} meta={gameMeta(s, x)} plays={plays[x.slug]} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
