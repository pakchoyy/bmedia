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
      <div className="bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] py-10 text-center px-4">
        <span className="inline-block nb-sm bg-white dark:bg-slate-900 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-nb-ink dark:text-white">
          📚 Katalog
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-nb-ink dark:text-white mt-3 mb-2">
          Semua <span className="nb-mark">Media</span> Pembelajaran
        </h1>
        <p className="text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
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
