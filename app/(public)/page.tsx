import Link from "next/link";
import { getHomeKarya, getKontributor, getSiteStats } from "@/lib/queries";
import GameCard from "@/components/GameCard";
import GameTile from "@/components/GameTile";
import WebLuarCard from "@/components/WebLuarCard";
import WaGroupButton from "@/components/WaGroupButton";
import Icon from "@/components/Icon";
import { MAIN_GAMES } from "@/lib/games";
import { WEB_LUAR } from "@/lib/links";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function SectionHead({ id, title, mark, desc, href, linkText }: { id: string; title: string; mark: string; desc: string; href?: string; linkText?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h2 id={id} className="font-display font-bold text-2xl sm:text-3xl text-nb-ink dark:text-white">
          {title} <span className="nb-mark">{mark}</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{desc}</p>
      </div>
      {href && (
        <Link href={href} className="nb-sm nb-hover nb-press bg-white dark:bg-slate-900 rounded-xl px-4 py-2 text-sm font-extrabold text-nb-ink dark:text-white inline-flex items-center gap-1.5">
          {linkText} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [karya, kontributor, stats] = await Promise.all([getHomeKarya(8), getKontributor(), getSiteStats()]);

  return (
    <div className="fade-in">
      {/* Hero ringkas */}
      <section className="relative overflow-hidden bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)]">
        <div aria-hidden="true" className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-nb-yellow/60 dark:bg-nb-yellow/20" />
        <div className="relative container mx-auto max-w-[1200px] px-5 py-8 sm:py-10 text-center">
          <h1 className="font-display font-bold text-nb-ink dark:text-white text-[2rem] leading-[1.1] sm:text-5xl">
            Belajar Jadi <span className="nb-mark">Seru</span> di <span className="text-nb-orange">Main-yuk</span>
          </h1>
          <p className="mt-3 text-[15px] sm:text-base text-slate-700 dark:text-slate-300 max-w-[560px] mx-auto">
            Kumpulan game edukasi gratis untuk SD–SMA. Soalnya bisa dibuat guru sendiri dan dimainkan bareng di kelas.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 justify-center">
            <a href="#game" className="nb nb-hover nb-press bg-nb-orange text-nb-ink font-extrabold rounded-xl px-5 py-3 inline-flex items-center gap-2">
              <Icon name="play" /> Main Sekarang
            </a>
            <Link href="/main" className="nb nb-hover nb-press bg-nb-yellow text-nb-ink font-extrabold rounded-xl px-5 py-3 inline-flex items-center gap-2">
              <Icon name="school" /> Masuk Kelas
            </Link>
          </div>
          <nav aria-label="Bagian beranda" className="mt-6 flex flex-wrap justify-center gap-2 text-sm font-extrabold">
            <a href="#game" className="nb-flat rounded-full bg-white dark:bg-slate-900 px-3 py-1.5 text-nb-ink dark:text-white">🎮 Game Main-yuk · {MAIN_GAMES.length}</a>
            <a href="#karya" className="nb-flat rounded-full bg-white dark:bg-slate-900 px-3 py-1.5 text-nb-ink dark:text-white">🧑‍🏫 Karya Kontributor · {stats.totalMedia}</a>
            <a href="#web" className="nb-flat rounded-full bg-white dark:bg-slate-900 px-3 py-1.5 text-nb-ink dark:text-white">🌐 Web Belajar Lain · {WEB_LUAR.length}</a>
          </nav>
        </div>
      </section>

      {/* 1. Game Main-yuk */}
      <section id="game" className="px-4 pt-10 scroll-mt-20" aria-labelledby="game-judul">
        <div className="container mx-auto max-w-[1200px]">
          <SectionHead id="game-judul" title="Game" mark="Main-yuk" desc="Game buatan Main-yuk. Bisa pakai soal sendiri dan dimainkan 1–4 pemain di IFP." href="/game" linkText="Semua game" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MAIN_GAMES.map((g) => <GameTile key={g.slug} game={g} />)}
            <Link href="/guru" className="nb-sm nb-hover rounded-2xl border-dashed bg-nb-cream/60 dark:bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[220px]">
              <Icon name="chalkboard-user" className="text-3xl text-nb-ink dark:text-white" />
              <span className="font-display font-bold text-lg text-nb-ink dark:text-white">Guru? Buat soalmu sendiri</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">Daftar gratis, ketik atau impor soal dari Word, bagikan kode ke murid.</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Karya Kontributor */}
      <section id="karya" className="px-4 pt-12 scroll-mt-20" aria-labelledby="karya-judul">
        <div className="container mx-auto max-w-[1200px]">
          <SectionHead id="karya-judul" title="Karya" mark="Kontributor" desc="Media buatan guru Indonesia. Bertanda ★ = Pilihan Main-yuk. Hak cipta milik pembuatnya." href="/catalog" linkText={`Lihat semua (${stats.totalMedia})`} />
          <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
            {karya.map((m) => <GameCard key={m.id} media={m} />)}
          </div>
        </div>
      </section>

      {/* 3. Web Belajar Lain */}
      <section id="web" className="px-4 pt-12 scroll-mt-20" aria-labelledby="web-judul">
        <div className="container mx-auto max-w-[1200px]">
          <SectionHead id="web-judul" title="Web Belajar" mark="Lain" desc="Rekomendasi web gratis pihak ketiga. Dibuka di tab baru." href="/web-belajar" linkText="Semua web" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WEB_LUAR.slice(0, 3).map((w) => <WebLuarCard key={w.url} w={w} />)}
          </div>
        </div>
      </section>

      {/* Kontributor + ajakan */}
      <section className="px-4 py-12" aria-labelledby="kontrib-judul">
        <div className="container mx-auto max-w-[1200px] nb rounded-2xl bg-nb-lilac/25 dark:bg-slate-900 p-6 sm:p-8 grid gap-6 lg:grid-cols-[1fr_auto] items-center">
          <div>
            <h2 id="kontrib-judul" className="font-display font-bold text-2xl text-nb-ink dark:text-white">Terima kasih, {kontributor.length} guru kontributor!</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {kontributor.slice(0, 10).map((k) => (
                <li key={k.name}><Link href={`/catalog?q=${encodeURIComponent(k.name)}`} className="nb-flat rounded-full bg-white dark:bg-slate-800 px-3 py-1 text-sm font-bold text-nb-ink dark:text-white inline-block">{k.name}</Link></li>
              ))}
              {kontributor.length > 10 && <li><Link href="/kontributor" className="rounded-full px-3 py-1 text-sm font-extrabold underline text-nb-ink dark:text-white inline-block">+{kontributor.length - 10} lainnya</Link></li>}
            </ul>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href="/submit" className="nb nb-hover nb-press bg-nb-orange text-nb-ink font-extrabold rounded-xl px-5 py-3 inline-flex items-center justify-center gap-2">
              <Icon name="plus" /> Kirim Karyamu
            </Link>
            <WaGroupButton className="justify-center" />
          </div>
        </div>
      </section>
    </div>
  );
}
