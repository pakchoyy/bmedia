"use client";

import Link from "next/link";
import type { Media } from "@/types/media";
import { formatPlays } from "@/lib/utils";
import MediaThumb from "./MediaThumb";
import Icon from "./Icon";

export default function GameCard({ media }: { media: Media }) {
  const trackOpen = () => {
    try {
      const p = fetch(`/api/play/${media.id}`, {
        method: "POST",
        keepalive: true,
      });
      // Biarkan request berjalan di background; jangan blokir navigasi.
      p.catch(() => {});
    } catch {
      // abaikan
    }
  };

  return (
    <Link
      href={`/media/${media.id}`}
      onClick={trackOpen}
      className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-800 hover:-translate-y-2 hover:shadow-md hover:border-primary-light transition-all duration-300 flex flex-col"
    >
      <div className="relative h-44 overflow-hidden">
        <div className="absolute top-2.5 right-2.5 bg-success text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
          {media.category}
        </div>
        <MediaThumb media={media} className="transition-transform duration-500 group-hover:scale-110" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-ink dark:text-slate-100 leading-snug mb-2 line-clamp-2">
          {media.title}
        </h3>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-slate-400 mb-2">
          <span className="flex items-center gap-1.5">
            <Icon name="book" className="text-primary-light" />
            {media.mapel}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="graduation-cap" className="text-primary-light" />
            {media.kelas}
          </span>
        </div>

        <div className="text-xs bg-primary-bg text-primary px-2 py-1 rounded-md inline-flex items-center gap-1.5 font-semibold mb-3 w-fit">
          <Icon name="wrench" className="text-[0.7rem]" />
          Dibuat dengan: {media.tool}
        </div>

        <div className="text-sm text-primary font-medium mt-auto border-t border-gray-200 dark:border-slate-800 pt-3">
          <Icon name="user-tie" className="text-gray-400 mr-1.5" />
          {media.guru_name}
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-slate-400">
          <span>
            <Icon name="school" className="mr-1" />
            {media.sekolah}
          </span>
          <span>
            <Icon name="users" className="text-accent mr-1" />
            {formatPlays(media.plays)} digunakan
          </span>
        </div>

        <div className="w-full mt-4 py-2 bg-primary-light text-white rounded-lg font-semibold text-sm text-center transition-colors group-hover:bg-primary">
          Buka Media
        </div>
      </div>
    </Link>
  );
}