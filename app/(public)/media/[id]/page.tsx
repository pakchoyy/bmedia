import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedMedia, getMediaById } from "@/lib/queries";
import { formatPlays } from "@/lib/utils";
import MediaThumb from "@/components/MediaThumb";
import PlayButton from "@/components/PlayButton";
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
    <div className="container mx-auto max-w-[1200px] px-6 py-12 fade-in">
      <Link
        href="/catalog"
        className="inline-flex items-center gap-2 text-primary border-2 border-primary rounded-full px-5 py-2 font-semibold mb-6 hover:bg-primary hover:text-white transition-colors"
      >
        <Icon name="arrow-left" />
        Kembali ke Koleksi
      </Link>

      {/* Detail header */}
      <div className="bg-white rounded-[15px] overflow-hidden shadow-md mb-8">
        <div className="w-full h-[400px] max-md:h-[220px]">
          <MediaThumb media={media} className="w-full h-full" />
        </div>

        <div className="p-8 flex flex-wrap justify-between items-start gap-8">
          <div className="flex-1 min-w-[300px]">
            <div className="flex flex-wrap gap-2.5 mb-4">
              <span className="bg-primary-bg text-primary px-3 py-1 rounded-full text-sm font-semibold">
                <Icon name="layer-group" className="mr-1" />
                {media.category}
              </span>
              <span className="bg-primary-bg text-primary px-3 py-1 rounded-full text-sm font-semibold">
                <Icon name="book" className="mr-1" />
                {media.mapel}
              </span>
              <span className="bg-primary-bg text-primary px-3 py-1 rounded-full text-sm font-semibold">
                <Icon name="graduation-cap" className="mr-1" />
                {media.jenjang} - {media.kelas}
              </span>
              <span className="bg-white border border-gray-300 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                <Icon name="wrench" className="mr-1" />
                Dibuat dengan: {media.tool}
              </span>
            </div>

            <h2 className="text-[2.5rem] font-bold text-primary leading-tight mb-3 max-md:text-3xl">
              {media.title}
            </h2>

            <p className="my-5 text-lg text-gray-600 leading-relaxed">
              {media.description}
            </p>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0">
                {media.guru_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-primary font-bold">{media.guru_name}</h4>
                <p className="text-sm text-gray-600">
                  <Icon name="school" className="mr-1" />
                  {media.sekolah}
                </p>
              </div>
            </div>
          </div>

          <div className="w-[300px] bg-pagebg p-6 rounded-xl shrink-0 max-md:w-full">
            <PlayButton mediaId={media.id} linkUrl={media.link_url} />
            <div className="flex justify-between text-sm text-gray-600 border-t border-gray-300 pt-3">
              <span>
                <Icon name="chart-simple" className="mr-1" />
                Digunakan: <strong>{formatPlays(media.plays)}</strong> kali
              </span>
              <span className="cursor-pointer text-primary-light">
                <Icon name="share-nodes" className="mr-1" />
                Bagikan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <h3 className="text-3xl font-bold text-primary mt-10 mb-6">
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
