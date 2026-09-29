"use client";

import Link from "next/link";
import type { Media } from "@/types/media";
import { formatPlays } from "@/lib/utils";
import MediaThumb from "./MediaThumb";
import Icon from "./Icon";

export default function GameCard({ media, categoryColor }: { media: Media; categoryColor?: string }) {
  const trackOpen = () => {
    try {
      fetch(`/api/play/${media.id}`, { method: "POST", keepalive: true }).catch(() => {});
    } catch {}
  };

  return (
    <Link
      href={`/media/${media.id}`}
      onClick={trackOpen}
      className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-md hover:border-primary-light transition-all duration-300 flex flex-col"
    >
      <div className="relative h-32 sm:h-44 overflow-hidden">
        <div
          className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold z-10"
          style={{ backgroundColor: categoryColor || "#16a34a" }}
        >
          {media.category}
        </div>
        <MediaThumb media={media} className="transition-transform duration-500 group-hover:scale-110" />
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="text-sm sm:text-base font-bold text-ink dark:text-slate-100 leading-snug mb-1.5 line-clamp-2">
          {media.title}
        </h3>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-gray-600 dark:text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Icon name="book" className="text-primary-light" />
            {media.mapel}
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <Icon name="graduation-cap" className="text-primary-light" />
            {media.kelas}
          </span>
        </div>

        <div className="hidden sm:inline-flex text-xs bg-primary-bg text-primary px-2 py-1 rounded-md items-center gap-1.5 font-semibold mb-2 w-fit">
          <Icon name="wrench" className="text-[0.7rem]" />
          {media.tool}
        </div>

        <div className="text-xs sm:text-sm text-primary font-medium mt-auto border-t border-gray-200 dark:border-slate-800 pt-2">
          <Icon name="user-tie" className="text-gray-400 mr-1" />
          {media.guru_name}
        </div>

        <div className="hidden sm:flex justify-between items-center mt-1.5 text-xs text-gray-500 dark:text-slate-400">
          <span>
            <Icon name="school" className="mr-1" />
            {media.sekolah}
          </span>
          <span>
            <Icon name="users" className="text-accent mr-1" />
            {formatPlays(media.plays)} digunakan
          </span>
        </div>

        <div className="w-full mt-2 sm:mt-3 py-1.5 sm:py-2 bg-primary-light text-white rounded-lg font-semibold text-xs sm:text-sm text-center transition-colors group-hover:bg-primary">
          Buka Media
        </div>
      </div>
    </Link>
  );
}