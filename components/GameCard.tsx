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
      <div className="relative aspect-video overflow-hidden border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)]">
        <MediaThumb media={media} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
        {media.featured && (
          <div className="absolute top-2 right-2 z-10 nb-flat rounded-full bg-nb-yellow text-nb-ink px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold inline-flex items-center gap-1 shadow-[2px_2px_0_#1b1a3a]">
            <Icon name="star" className="text-[10px]" /> Pilihan
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 gap-1.5">
        <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-nb-ink dark:text-slate-100 leading-snug line-clamp-2">
          {media.title}
        </h3>
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 nb-flat rounded-md bg-white px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-nb-ink">
            <span aria-hidden="true" className="w-2 h-2 rounded-full border border-nb-ink" style={{ backgroundColor: categoryColor || "#16a34a" }} />
            {media.category}
          </span>
          <span className="nb-flat rounded-md bg-nb-yellow/40 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-nb-ink dark:text-slate-100">{media.mapel}</span>
          <span className="nb-flat rounded-md bg-nb-lilac/35 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-nb-ink dark:text-slate-100">{media.jenjang}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
          <span className="font-semibold text-nb-ink dark:text-slate-200">{media.guru_name}</span>
          <span className="hidden sm:inline"> · {formatPlays(media.plays)}× dimainkan</span>
        </p>
        <div className="mt-auto nb-sm py-1.5 rounded-xl bg-nb-orange text-nb-ink font-extrabold text-xs sm:text-sm text-center group-hover:bg-nb-ink group-hover:text-white transition-colors">
          ▶ Main
        </div>
      </div>
    </Link>
  );
}
