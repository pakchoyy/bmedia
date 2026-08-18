import type { Media } from "@/types/media";
import GameCard from "./GameCard";
import Link from "next/link";
import Icon from "./Icon";

interface MediaTerbaruProps {
  media: Media[];
  limit?: number;
}

export default function MediaTerbaru({ media, limit = 8 }: MediaTerbaruProps) {
  const displayMedia = media.slice(0, limit);

  return (
    <section className="py-6 px-4">
      <div className="container mx-auto max-w-[1200px]">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-ink dark:text-slate-100 mb-3">
            Media Terbaru
          </h2>
          <p className="text-gray-600 dark:text-slate-400">
            Karya terbaru dari guru Indonesia
          </p>
        </div>

        {displayMedia.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="clipboard" className="text-6xl text-gray-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400 text-lg">
              Media belum tersedia
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayMedia.map((m) => (
                <GameCard key={m.id} media={m} />
              ))}
            </div>

            {media.length > limit && (
              <div className="text-center mt-10">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 bg-primary-light hover:bg-primary text-white px-8 py-3 rounded-full font-semibold text-base transition-all hover:scale-105"
                >
                  Lihat Semua Media
                  <Icon name="arrow-up-right-from-square" className="text-sm" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
