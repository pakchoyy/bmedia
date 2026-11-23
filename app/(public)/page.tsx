import Link from "next/link";
import { getHomeKarya, getSiteStats, getUlasan } from "@/lib/queries";
import GameCard from "@/components/GameCard";
import GameTile from "@/components/GameTile";
import WebLuarCard from "@/components/WebLuarCard";
import WaGroupButton from "@/components/WaGroupButton";
import SearchBox from "@/components/SearchBox";
import UlasanMarquee from "@/components/UlasanMarquee";
import Icon from "@/components/Icon";
import { MAIN_GAMES } from "@/lib/games";
import { getWebLinks } from "@/lib/links";
import { getSettings, coverKey, gameMeta, HERO_KEY, HERO_DEFAULT } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function SectionHead({ id, title, mark, desc, href, linkText }: { id: string; title: string; mark: string; desc: string; href?: string; linkText?: string }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4 sm:mb-5">
      <div className="min-w-0">
        <h2 id={id} className="font-display font-bold text-[1.6rem] leading-tight sm:text-3xl text-nb-ink dark:text-white">
          {title} <span className="nb-mark">{mark}</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{desc}</p>
      </div>
      {href && (
        <Link href={href} className="shrink-0 nb-sm nb-hover nb-press bg-white dark:bg-slate-900 rounded-xl px-3 sm:px-4 py-2 text-sm font-extrabold text-nb-ink dark:text-white inline-flex items-center gap-1">
          {linkText} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [karya, ulasan, stats, links, settings] = await Promise.all([
    getHomeKarya(8), getUlasan(), getSiteStats(), getWebLinks(), getSettings(),
  ]);
  const hero = settings[HERO_KEY] || HERO_DEFAULT;
  // Beranda: satu web dari tiap kategori, lalu tambahan sampai 6
  const satuPerKategori = links.filter((w, i, a) => a.findIndex((x) => x.kategori === w.kategori) === i);
  const webPilihan = [...satuPerKategori, ...links.filter((w) => !satuPerKategori.includes(w))].slice(0, 6);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="relative z-20 bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-nb-yellow/60 dark:bg-nb-yellow/20" /></div>
        <div className="relative container mx-auto max-w-[1200px] px-4 sm:px-5 py-6 sm:py-8 grid gap-6 lg:grid-cols-[1.2fr_1fr] items-center">
          <div className="max-lg:text-center">
            <h1 className="font-display font-bold text-nb-ink dark:text-white text-[1.75rem] leading-[1.1] sm:text-5xl">
              Belajar Jadi <span className="nb-mark">Seru</span> di <span className="text-nb-orange whitespace-nowrap">Main-yuk</span>
            </h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-[520px] max-lg:mx-auto">
              Game edukasi SD–SMA, sebagian bisa diisi soal buatan guru sendiri. Main sendiri, adu cepat di layar kelas, atau mabar pakai kode.
            </p>
            <SearchBox className="mt-4 sm:mt-5 max-w-[520px] max-lg:mx-auto" />
            <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3 max-lg:justify-center">
              <a href="#game" className="nb nb-hover nb-press bg-nb-orange text-nb-ink font-extrabold rounded-xl px-3 sm:px-5 py-2.5 sm:py-3 text-[15px] sm:text-base whitespace-nowrap inline-flex items-center justify-center gap-2">
                <Icon name="play" /> Main Sekarang
              </a>
              <Link href="/main" className="nb nb-hover nb-press bg-nb-yellow text-nb-ink font-extrabold rounded-xl px-3 sm:px-5 py-2.5 sm:py-3 text-[15px] sm:text-base whitespace-nowrap inline-flex items-center justify-center gap-2">
                <Icon name="users" /> Mabar Yuk
              </Link>
            </div>
          </div>
          <div className="relative max-w-[440px] w-full mx-auto max-sm:max-w-[280px]">
            <div className="nb rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-yellow">
                <span className="w-2.5 h-2.5 rounded-full bg-nb-pink border-2 border-nb-ink" />
                <span className="w-2.5 h-2.5 rounded-full bg-nb-orange border-2 border-nb-ink" />
                <span className="w-2.5 h-2.5 rounded-full bg-nb-mint border-2 border-nb-ink" />
                <span className="ml-auto text-[10px] font-extrabold uppercase tracking-wider text-nb-ink">main-yuk</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero} alt="Ilustrasi murid belajar dengan game di Main-yuk" className="w-full aspect-[16/9] object-cover block" />
            </div>
          </div>
        </div>
      </section>

      {/* 1. Karya Admin Main-yuk */}
      <section id="game" className="px-4 pt-8 sm:pt-10 scroll-mt-20" aria-labelledby="game-judul">
        <div className="container mx-auto max-w-[1200px]">
          <SectionHead id="game-judul" title="Karya Admin" mark="Main-yuk" desc="Game buatan Main-yuk. Tombol biru ✏️ artinya game itu bisa diisi soalmu sendiri." href="/game" linkText="Semua" />
          <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
            {MAIN_GAMES.map((g) => <GameTile key={g.slug} game={g} cover={settings[coverKey(g.slug)]} meta={gameMeta(settings, g)} />)}
          </div>
          <Link href="/guru" className="mt-4 nb-sm nb-hover rounded-2xl bg-nb-mint/25 dark:bg-slate-900 px-4 py-3 flex items-center gap-3">
            <Icon name="chalkboard-user" className="text-2xl text-nb-ink dark:text-white shrink-0" />
            <span className="min-w-0">
              <span className="block font-display font-bold text-nb-ink dark:text-white">Guru? Pakai soalmu sendiri</span>
              <span className="block text-sm text-slate-600 dark:text-slate-400">Daftar di Ruang Guru, ketik soal atau unggah file Word/CSV, lalu bagikan kode ke murid.</span>
            </span>
            <span aria-hidden="true" className="ml-auto font-extrabold text-nb-ink dark:text-white">→</span>
          </Link>
        </div>
      </section>

      {/* 2. Karya Kontributor */}
      <section id="karya" className="pt-10 sm:pt-12 scroll-mt-20" aria-labelledby="karya-judul">
        <UlasanMarquee items={ulasan} />
        <div className="container mx-auto max-w-[1200px] px-4 pt-6">
          <SectionHead id="karya-judul" title="Karya" mark="Kontributor" desc="Media buatan guru Indonesia. Hak cipta milik pembuatnya." href="/catalog" linkText={`Semua (${stats.totalMedia})`} />
          <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
            {karya.map((m) => <GameCard key={m.id} media={m} />)}
          </div>
        </div>
      </section>

      {/* 3. Web Belajar Lain */}
      <section id="web" className="px-4 pt-10 sm:pt-12 scroll-mt-20" aria-labelledby="web-judul">
        <div className="container mx-auto max-w-[1200px]">
          <SectionHead id="web-judul" title="Web Belajar" mark="Lain" desc="Platform pihak ketiga pilihan. Dibuka di tab baru." href="/web-belajar" linkText={`Semua (${links.length})`} />
          <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
            {webPilihan.map((w, i) => <WebLuarCard key={w.id} w={w} i={i} />)}
          </div>
        </div>
      </section>

      {/* Ajakan */}
      <section className="px-4 py-10 sm:py-12" aria-labelledby="ajak-judul">
        <div className="container mx-auto max-w-[1200px] nb rounded-2xl bg-nb-lilac/25 dark:bg-slate-900 p-5 sm:p-8 grid gap-5 lg:grid-cols-[1fr_auto] items-center">
          <div>
            <h2 id="ajak-judul" className="font-display font-bold text-2xl text-nb-ink dark:text-white">Punya ide game atau menemukan kendala?</h2>
            <p className="mt-1 text-slate-700 dark:text-slate-300">Kirim saran, bagikan karyamu, atau ngobrol bareng guru lain di grup WA.</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap lg:grid lg:grid-cols-1">
            <Link href="/usulan" className="nb nb-hover nb-press bg-nb-orange text-nb-ink font-extrabold rounded-xl px-4 py-2.5 text-sm inline-flex items-center justify-center gap-2">💡 Kirim Saran</Link>
            <Link href="/submit" className="nb-sm nb-press bg-white text-nb-ink font-extrabold rounded-xl px-4 py-2.5 text-sm inline-flex items-center justify-center gap-2"><Icon name="plus" /> Kirim Karya</Link>
            <WaGroupButton className="justify-center" />
            <Link href="/traktir" className="nb-sm nb-press inline-flex items-center justify-center gap-2 bg-nb-yellow text-nb-ink font-extrabold rounded-xl px-4 py-2.5 text-sm">☕ Traktir</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
