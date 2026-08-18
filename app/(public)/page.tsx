import Link from "next/link";
import { getApprovedMedia, getSiteStats } from "@/lib/queries";
import Icon from "@/components/Icon";
import SearchMedia from "@/components/SearchMedia";
import PopularCategories from "@/components/PopularCategories";
import MediaTerbaru from "@/components/MediaTerbaru";
import CTABuatGame from "@/components/CTABuatGame";
import CTAKirimKarya from "@/components/CTAKirimKarya";
import Stats from "@/components/Stats";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [media, stats] = await Promise.all([
    getApprovedMedia(),
    getSiteStats(),
  ]);

  // Sort media by date (newest first)
  const sortedMedia = [...media].sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="bg-bgy-hero text-white overflow-hidden relative">
        {/* Decorative floating shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" style={{animation:'float 8s ease-in-out infinite'}} />
          <div className="absolute top-1/3 -left-16 w-40 h-40 bg-white/5 rounded-full blur-2xl" style={{animation:'floatSlow 6s ease-in-out infinite'}} />
          <div className="absolute bottom-8 right-1/4 w-24 h-24 bg-white/[0.04] rounded-full blur-xl" style={{animation:'float 10s ease-in-out infinite'}} />
          <div className="absolute top-8 left-1/3 w-16 h-16 bg-white/[0.06] rounded-full blur-lg" style={{animation:'floatSlow 7s ease-in-out infinite'}} />
          <div className="absolute bottom-1/3 right-10 w-12 h-12 bg-accent/10 rounded-full blur-md" style={{animation:'float 5s ease-in-out infinite'}} />
        </div>

        <div className="container mx-auto max-w-[1200px] px-6 py-8 max-md:py-6 relative z-10">
          <div className="flex items-center gap-10 max-lg:flex-col max-lg:text-center">
            {/* Left: Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap justify-start gap-2 mb-3 max-lg:justify-center">
                {["✓ Gratis", "✓ Karya Guru Indonesia", "✓ Interaktif"].map((b) => (
                  <span
                    key={b}
                    className="bg-white/15 rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {b}
                  </span>
                ))}
              </div>

              <h1 className="text-white text-6xl leading-tight font-extrabold mb-2 max-md:text-5xl max-sm:text-4xl">
                Bantu Guru Yuk
              </h1>
              <h2 className="text-white text-2xl leading-relaxed font-medium mb-3 max-md:text-xl text-balance">
                Media Belajar Interaktif Karya Guru Indonesia
              </h2>

              <p className="text-lg mb-5 opacity-90 leading-relaxed max-w-[480px] max-lg:mx-auto">
                Temukan, gunakan, dan bagikan media pembelajaran untuk membuat pembelajaran lebih menarik.
              </p>

              <div className="flex flex-wrap items-center gap-3 max-lg:justify-center">
                <a
                  href="#search"
                  className="bg-accent text-white rounded-full px-7 py-3.5 text-base font-bold inline-flex items-center gap-2 hover:bg-[#e06c0d] hover:scale-105 transition-all shadow-lg"
                >
                  <Icon name="compass" />
                  Jelajahi Media
                </a>
                <Link
                  href="/buat"
                  className="bg-white/15 border border-white/30 text-white rounded-full px-6 py-3 text-base font-semibold inline-flex items-center gap-2 hover:bg-white/25 transition-colors"
                >
                  <Icon name="gamepad" />
                  Buat Game Sendiri
                </Link>
                <Link
                  href="/submit"
                  className="text-white/90 rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 hover:text-white hover:underline underline-offset-4 transition-colors"
                >
                  <Icon name="plus" />
                  Kirim Karya
                </Link>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="w-1/2 max-lg:w-full max-lg:mt-6 max-lg:max-w-[360px] max-lg:mx-auto">
              <img
                src="/hero-banner.webp"
                alt="Ilustrasi media belajar interaktif bersama guru"
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Media */}
      <SearchMedia />

      {/* Popular Categories */}
      <PopularCategories />

      {/* Media Terbaru */}
      <MediaTerbaru media={sortedMedia} limit={8} />

      {/* Stats */}
      <Stats stats={stats} />

      {/* CTA Buat Game & Kirim Karya */}
      <section className="py-14 px-6">
        <div className="container mx-auto max-w-[1200px] grid gap-6 lg:grid-cols-2">
          <CTABuatGame />
          <CTAKirimKarya />
        </div>
      </section>
    </div>
  );
}
