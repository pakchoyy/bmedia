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
      <section className="bg-bgy-hero text-white overflow-hidden">
        <div className="container mx-auto max-w-[1200px] px-6 py-10 max-md:py-8">
          <div className="flex items-center gap-8 max-lg:flex-col max-lg:text-center">
            {/* Left: Content in transparent glass card */}
            <div className="flex-1 min-w-0">
              <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-7 max-md:p-5">
                <div className="flex flex-wrap justify-start gap-2 mb-4 max-lg:justify-center">
                  {["✓ Gratis", "✓ Karya Guru Indonesia", "✓ Interaktif"].map((b) => (
                    <span
                      key={b}
                      className="bg-white/20 border border-white/25 rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <h1 className="text-white text-6xl leading-tight font-extrabold mb-3 max-md:text-5xl max-sm:text-4xl">
                  Bantu Guru Yuk
                </h1>
                <h2 className="text-white text-2xl leading-relaxed font-medium mb-4 max-md:text-xl text-balance">
                  Media Belajar Interaktif Karya Guru Indonesia
                </h2>

                <p className="text-lg mb-6 opacity-95 leading-relaxed max-w-[520px] max-lg:mx-auto">
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
                    className="bg-white/15 border border-white/40 text-white rounded-full px-6 py-3 text-base font-semibold inline-flex items-center gap-2 hover:bg-white/25 transition-colors backdrop-blur-sm"
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
            </div>

            {/* Right: Hero Image — setengah banner */}
            <div className="w-1/2 max-lg:w-full max-lg:mt-6 max-lg:max-w-[360px] max-lg:mx-auto">
              <div className="w-full max-w-[520px] mx-auto">
                <img
                  src="/hero-banner.webp"
                  alt="Ilustrasi media belajar interaktif bersama guru"
                  className="w-full h-auto rounded-3xl border-2 border-white/30 shadow-2xl"
                />
              </div>
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
