import Link from "next/link";
import { getApprovedMedia, getSiteStats } from "@/lib/queries";
import Icon from "@/components/Icon";
import HomeMediaSection from "@/components/HomeMediaSection";
import CTABuatGame from "@/components/CTABuatGame";
import CTAKirimKarya from "@/components/CTAKirimKarya";
import Stats from "@/components/Stats";
import GameShowcase from "@/components/GameShowcase";
import HomeCategories from "@/components/HomeCategories";
import { MAIN_GAMES } from "@/lib/games";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [media, stats] = await Promise.all([
    getApprovedMedia(),
    getSiteStats(),
  ]);

  const sortedMedia = [...media].sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  return (
    <div className="fade-in">
      {/* Hero — neo-brutalism */}
      <section className="relative overflow-hidden bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)]">
        {/* Hiasan bentuk */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-nb-yellow/60 dark:bg-nb-yellow/20" />
          <div className="absolute bottom-6 left-[42%] w-10 h-10 rotate-12 bg-nb-pink nb-sm max-lg:hidden" />
          <div className="absolute top-10 right-8 w-24 h-24 rounded-full bg-nb-blue/20" />
        </div>

        <div className="relative container mx-auto max-w-[1200px] px-5 py-8 sm:py-12 grid gap-8 lg:grid-cols-[1.05fr_1fr] items-center">
          <div className="max-lg:text-center">
            <span className="inline-block bg-white dark:bg-slate-900 nb-sm rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-nb-ink dark:text-slate-100">
              <Icon name="school" className="mr-1.5 inline -mt-0.5" />Game &amp; Media Belajar · SD – SMA
            </span>

            <h1 className="font-display font-bold text-nb-ink dark:text-white text-[2.1rem] leading-[1.1] sm:text-5xl mt-4">
              Belajar Jadi <span className="nb-mark">Seru</span>
              <br className="max-sm:hidden" /> Bareng <span className="text-nb-blue">Guru Indonesia</span>
              <span className="nb-cursor text-nb-blue">_</span>
            </h1>

            <p className="mt-3 text-[15px] sm:text-base text-slate-700 dark:text-slate-300 max-w-[480px] max-lg:mx-auto">
              Ratusan game, kuis, dan lab maya <b>karya guru</b>. Gratis dipakai di kelas, bisa main pakai kode dari guru.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 max-lg:justify-center">
              <a href="#media" className="nb nb-hover nb-press bg-nb-orange text-nb-ink font-extrabold rounded-xl px-5 py-3 inline-flex items-center gap-2">
                <Icon name="compass" /> Jelajahi Media
              </a>
              <Link href="/main" className="nb nb-hover nb-press bg-nb-yellow text-nb-ink font-extrabold rounded-xl px-5 py-3 inline-flex items-center gap-2">
                <Icon name="gamepad" /> Masuk Kelas
              </Link>
              <Link href="/submit" className="nb-sm nb-hover nb-press bg-white dark:bg-slate-900 text-nb-ink dark:text-white font-bold rounded-xl px-4 py-3 inline-flex items-center gap-2">
                <Icon name="plus" /> Kirim Karya
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 max-lg:justify-center text-xs font-bold">
              <span className="nb-flat rounded-full bg-nb-mint/25 px-2.5 py-1 text-nb-ink dark:text-white">✓ Gratis</span>
              <span className="nb-flat rounded-full bg-nb-lilac/30 px-2.5 py-1 text-nb-ink dark:text-white">✓ Karya Guru Indonesia</span>
              <span className="nb-flat rounded-full bg-nb-pink/25 px-2.5 py-1 text-nb-ink dark:text-white">✓ Interaktif</span>
            </div>
          </div>

          {/* Jendela ilustrasi */}
          <div className="relative max-w-[520px] w-full mx-auto">
            <div className="nb rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-yellow">
                <span className="w-3 h-3 rounded-full bg-nb-pink border-2 border-nb-ink" />
                <span className="w-3 h-3 rounded-full bg-nb-orange border-2 border-nb-ink" />
                <span className="w-3 h-3 rounded-full bg-nb-mint border-2 border-nb-ink" />
                <span className="ml-auto text-[10px] font-extrabold uppercase tracking-wider text-nb-ink">main-yuk</span>
              </div>
              <img src="/hero-banner.webp" alt="Ilustrasi media belajar interaktif bersama guru" className="w-full h-auto block" />
            </div>
            <div className="nb-sm nb-float absolute -left-3 -top-4 sm:-left-6 bg-nb-mint text-nb-ink rounded-xl px-3 py-1.5 text-xs font-extrabold" style={{ ["--r" as string]: "-8deg" }}>
              <Icon name="gamepad" className="mr-1 inline -mt-0.5" />Game Edukasi
            </div>
            <div className="nb-sm nb-float absolute -right-2 -bottom-4 sm:-right-5 bg-nb-pink text-nb-ink rounded-xl px-3 py-1.5 text-xs font-extrabold" style={{ ["--r" as string]: "6deg", animationDelay: "1.2s" }}>
              <Icon name="flask" className="mr-1 inline -mt-0.5" />Lab Maya
            </div>
          </div>
        </div>
      </section>

      {/* Kategori */}
      <HomeCategories />

      {/* Game unggulan */}
      <section className="px-4 pt-8">
        <div className="container mx-auto max-w-[1200px]">
          <GameShowcase game={MAIN_GAMES[0]} compact />
        </div>
      </section>

      {/* Search + Filter + Media Grid — all-in-one */}
      <div id="media">
        <HomeMediaSection media={sortedMedia} />
      </div>

      {/* Stats */}
      <Stats stats={stats} />

      {/* CTA */}
      <section className="py-4 px-6">
        <div className="container mx-auto max-w-[1200px] grid gap-4 lg:grid-cols-2">
          <CTABuatGame />
          <CTAKirimKarya />
        </div>
      </section>
    </div>
  );
}
