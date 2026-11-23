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
      className="group nb nb-hover bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col"
    >
      <div className="relative h-32 sm:h-44 overflow-hidden border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)]">
        <div
          className="absolute top-2 left-2 z-10 nb-flat rounded-full bg-white px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-nb-ink inline-flex items-center gap-1"
        >
          <span aria-hidden="true" className="w-2 h-2 rounded-full border border-nb-ink" style={{ backgroundColor: categoryColor || "#16a34a" }} />
          {media.category}
        </div>
        {media.featured && (
          <div className="absolute top-2 right-2 z-10 nb-flat rounded-full bg-nb-yellow text-nb-ink px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold inline-flex items-center gap-1">
            <Icon name="star" className="text-[10px]" /> Pilihan
          </div>
        )}
        <MediaThumb media={media} className="transition-transform duration-500 group-hover:scale-105" />
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-[15px] sm:text-lg text-nb-ink dark:text-slate-100 leading-snug mb-1.5 line-clamp-2">
          {media.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="nb-flat rounded-md bg-nb-yellow/40 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-nb-ink dark:text-slate-100">
            {media.mapel}
          </span>
          <span className="hidden sm:inline nb-flat rounded-md bg-nb-blue/15 px-1.5 py-0.5 text-[11px] font-bold text-nb-ink dark:text-slate-100">
            {media.kelas}
          </span>
          <span className="hidden sm:inline nb-flat rounded-md bg-nb-mint/20 px-1.5 py-0.5 text-[11px] font-bold text-nb-ink dark:text-slate-100">
            {media.tool}
          </span>
        </div>

        <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mt-auto truncate">
          <Icon name="user-tie" className="mr-1 text-nb-orange" />
          <span className="font-normal opacity-70">Karya </span>{media.guru_name}
        </div>
        <div className="hidden sm:flex justify-between items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="truncate">
            <Icon name="school" className="mr-1" />
            {media.sekolah}
          </span>
          <span className="shrink-0">
            <Icon name="users" className="mr-1 text-nb-orange" />
            {formatPlays(media.plays)}×
          </span>
        </div>

        <div className="nb-sm mt-3 py-1.5 sm:py-2 rounded-xl bg-nb-orange text-nb-ink font-extrabold text-xs sm:text-sm text-center group-hover:bg-nb-ink group-hover:text-white transition-colors">
          Buka Media →
        </div>
      </div>
    </Link>
  );
}
