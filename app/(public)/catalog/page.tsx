import type { Metadata } from "next";
import { getApprovedMedia } from "@/lib/queries";
import SearchFilter from "@/components/SearchFilter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Katalog Media",
  description:
    "Jelajahi koleksi media pembelajaran interaktif karya guru Indonesia. Cari, filter, dan gunakan di kelas Anda.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { kategori?: string; q?: string };
}) {
  const media = await getApprovedMedia();

  return (
    <div className="fade-in pb-10">
      <div className="bg-bgy-hero text-white py-14 text-center px-4">
        <h1 className="text-4xl font-bold mb-2">Katalog Media Pembelajaran</h1>
        <p className="opacity-90 max-w-xl mx-auto">
          Koleksi media pembelajaran interaktif karya guru Indonesia. Gunakan
          pencarian dan filter untuk menemukan media yang tepat untuk kelas Anda.
        </p>
      </div>

      <SearchFilter
        media={media}
        initialCategory={searchParams.kategori ?? ""}
        initialQuery={searchParams.q ?? ""}
      />
    </div>
  );
}
