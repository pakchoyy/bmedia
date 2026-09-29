import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedMedia, getMediaById } from "@/lib/queries";
import MediaThumb from "@/components/MediaThumb";
import MediaPlayPanel from "@/components/MediaPlayPanel";
import GameCard from "@/components/GameCard";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const media = await getMediaById(params.id);
  if (!media) return { title: "Media Tidak Ditemukan" };
  return {
    title: media.title,
    description: media.description,
  };
}

export default async function MediaDetailPage({ params }: Props) {
  const media = await getMediaById(params.id);
  if (!media) notFound();

  const allMedia = await getApprovedMedia();
  const sameMapel = allMedia.filter((m) => m.id !== media.id && m.mapel === media.mapel);
  const recommendations = (
    sameMapel.length >= 3
      ? sameMapel
      : allMedia.filter((m) => m.id !== media.id)
  )
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  return (
    <div className="container mx-auto max-w-[1200px] px-6 py-6 fade-in">
      {/* Detail header */}
      <div className="bg-white dark:bg-slate-900 rounded-[15px] overflow-hidden shadow-md mb-8 border border-gray-100 dark:border-slate-800">
        <div className="w-full h-[400px] max-md:h-[220px]">
          <MediaThumb media={media} className="w-full h-full" />
        </div>

        <div className="p-8 max-md:p-5">
          <div className="flex flex-wrap gap-2 mb-3 text-xs font-semibold">
            <span className="bg-primary-bg text-primary px-2.5 py-1 rounded-full">{media.category}</span>
            <span className="bg-primary-bg text-primary px-2.5 py-1 rounded-full">{media.mapel}</span>
            <span className="bg-primary-bg text-primary px-2.5 py-1 rounded-full">
              {media.jenjang === "Umum" ? "Semua jenjang" : `${media.jenjang} · ${media.kelas}`}
            </span>
          </div>

          <h2 className="text-3xl font-bold text-primary dark:text-primary-light leading-tight mb-3 max-md:text-2xl">
            {media.title}
          </h2>

          <p className="text-base text-gray-600 dark:text-slate-300 leading-relaxed mb-5 max-w-2xl">
            {media.description}
          </p>

          <MediaPlayPanel
            mediaId={media.id}
            linkUrl={media.link_url}
            initialPlays={media.plays}
          />

          <p className="text-sm text-gray-500 dark:text-slate-400 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
            Dibuat oleh <strong className="text-primary dark:text-primary-light">{media.guru_name}</strong>
            {media.sekolah && media.sekolah !== "-" ? ` · ${media.sekolah}` : ""}
            {media.tool && media.tool !== "Lainnya" ? ` · ${media.tool}` : ""}
          </p>
        </div>
      </div>

      <Link
        href="/catalog"
        className="inline-flex items-center gap-2 text-primary border-2 border-primary rounded-full px-5 py-2 font-semibold my-6 hover:bg-primary hover:text-white transition-colors"
      >
        <Icon name="arrow-left" />
        Kembali ke Koleksi
      </Link>

      {/* Recommendations */}
      <h3 className="text-3xl font-bold text-primary mt-6 mb-6">
        Rekomendasi Media Serupa
      </h3>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((m) => (
          <GameCard key={m.id} media={m} />
        ))}
      </div>
      {recommendations.length === 0 && (
        <p className="text-gray-500">Belum ada rekomendasi lain.</p>
      )}
    </div>
  );
}
