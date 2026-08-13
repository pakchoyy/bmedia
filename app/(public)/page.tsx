import Link from "next/link";
import { getApprovedMedia, getSiteStats, getTrendingMedia } from "@/lib/queries";
import HomeCatalog from "@/components/HomeCatalog";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [media, trending, stats] = await Promise.all([
    getApprovedMedia(),
    getTrendingMedia(5),
    getSiteStats(),
  ]);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="bg-bgy-hero text-white py-20">
        <div className="container mx-auto max-w-[1200px] px-6 flex items-center justify-center text-center">
          <div className="max-w-[800px] flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-2.5 mb-4">
              {["Gratis", "Dibuat Guru Indonesia", "Media Interaktif"].map((b) => (
                <span
                  key={b}
                  className="bg-white/20 border border-white/30 rounded-full px-3 py-1 text-[0.8rem]"
                >
                  <Icon name="check" className="inline mr-1" />
                  {b}
                </span>
              ))}
            </div>
            <h1 className="text-white text-5xl leading-tight font-bold mb-4 max-md:text-4xl">
              Bantu Guru Yuk - Belajar
            </h1>
            <p className="text-lg mb-8 opacity-90">
              Media Pembelajaran Interaktif Karya Guru Indonesia.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              <a
                href="#catalog"
                className="bg-accent text-white rounded-full px-6 py-3 text-lg font-semibold inline-flex items-center gap-2 hover:bg-[#e06c0d] hover:scale-105 transition-all"
              >
                <Icon name="compass" />
                Jelajahi Media
              </a>
              <Link
                href="/buat"
                className="bg-white text-primary rounded-full px-6 py-3 text-lg font-semibold inline-flex items-center gap-2 hover:bg-primary-bg hover:scale-105 transition-all relative"
              >
                <Icon name="gamepad" />
                Buat Game Sendiri
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Baru
                </span>
              </Link>
              <Link
                href="/submit"
                className="bg-transparent border-2 border-white text-white rounded-full px-6 py-3 text-lg font-semibold inline-flex items-center gap-2 hover:bg-white hover:text-primary transition-colors"
              >
                <Icon name="plus" />
                Kirim Karya
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="-mt-10 relative z-10 px-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-10 text-center max-w-[900px] mx-auto border border-gray-100 dark:border-slate-800 max-md:p-6">
          <h2 className="text-primary text-2xl font-bold mb-4">
            Tentang Bantu Guru Yuk - Belajar
          </h2>
          <p className="text-gray-600 dark:text-slate-300 text-base leading-relaxed">
            Sebuah wadah berbagi inovasi digital bagi seluruh guru di Indonesia.
            Kami mengumpulkan berbagai media pembelajaran interaktif yang dibuat
            langsung oleh guru, untuk guru. Jelajahi karya menarik, gunakan
            dengan mudah di kelas Anda, atau ikut berkontribusi dengan mengirimkan
            media pembelajaran buatan Anda sendiri demi mewujudkan merdeka belajar.
          </p>
        </div>
      </section>

      <HomeCatalog media={media} trending={trending} stats={stats} />
    </div>
  );
}
