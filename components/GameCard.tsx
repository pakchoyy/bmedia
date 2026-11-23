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
      <div className="relative aspect-[16/10] overflow-hidden border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)]">
        <MediaThumb media={media} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full border-2 border-nb-ink bg-white/85 backdrop-blur-sm px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-nb-ink shadow-[2px_2px_0_#1b1a3a]">
          <span aria-hidden="true" className="w-2 h-2 rounded-full border border-nb-ink" style={{ backgroundColor: categoryColor || "#16a34a" }} />
          {media.category}
        </span>
        {media.featured && (
          <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full border-2 border-nb-ink bg-nb-yellow/90 backdrop-blur-sm px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-nb-ink shadow-[2px_2px_0_#1b1a3a]">
            <Icon name="star" className="text-[10px]" /> Pilihan
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 gap-1.5">
        <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-nb-ink dark:text-slate-100 leading-snug line-clamp-2">
          {media.title}
        </h3>
        <div className="flex flex-wrap gap-1">
          <span className="nb-flat rounded-md bg-nb-yellow/40 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-nb-ink dark:text-slate-100">{media.mapel}</span>
          <span className="nb-flat rounded-md bg-nb-lilac/35 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-nb-ink dark:text-slate-100">{media.jenjang}</span>
          <span className="hidden sm:inline nb-flat rounded-md bg-nb-blue/15 px-1.5 py-0.5 text-[11px] font-bold text-nb-ink dark:text-slate-100">{media.kelas}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1 min-w-0"><Icon name="user-tie" className="shrink-0 text-nb-orange" /><span className="truncate font-semibold text-nb-ink dark:text-slate-200">{media.guru_name}</span></span>
          <span className="flex items-center gap-1 shrink-0"><Icon name="users" className="text-nb-orange" />{formatPlays(media.plays)}×</span>
        </div>
        <div className="nb-sm py-1.5 sm:py-2 rounded-xl bg-nb-orange text-nb-ink font-extrabold text-xs sm:text-sm text-center group-hover:bg-nb-ink group-hover:text-white transition-colors">
          ▶ Main
        </div>
      </div>
    </Link>
  );
}
