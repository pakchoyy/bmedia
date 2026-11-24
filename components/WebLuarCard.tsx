"use client";

import Icon from "./Icon";
import DetailSheet, { useDetailSheet } from "./DetailSheet";
import { hostOf, WEB_COLORS } from "@/lib/web-link-utils";
import type { WebLuar } from "@/lib/links";

export default function WebLuarCard({ w, i = 0 }: { w: WebLuar; i?: number }) {
  const sheet = useDetailSheet();
  const openSheet = (e: React.MouseEvent) => {
    e.preventDefault();
    sheet.open({
      key: "web-" + w.id, title: w.name,
      // eslint-disable-next-line @next/next/no-img-element
      cover: w.cover ? <img src={w.cover} alt="" className="w-full h-full object-cover" /> : undefined,
      badges: [w.kategori, w.mapel].filter(Boolean), desc: w.description, meta: hostOf(w.url),
      actions: [{ label: "↗ Buka situsnya", href: w.url, tone: "main", external: true }],
    });
  };
  return (
    <>
    <a href={w.url} target="_blank" rel="noopener noreferrer" onClick={openSheet}
      className="group nb nb-hover nb-press rounded-2xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] bg-nb-cream">
        {w.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={w.cover} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center font-display font-bold text-5xl text-nb-ink ${WEB_COLORS[i % WEB_COLORS.length]}`}>{w.name.charAt(0)}</div>
        )}
        {!w.cover && <span className="absolute top-2 left-2 nb-flat rounded-full bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-nb-ink">{w.kategori}</span>}
      </div>
      <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <div>
          <h3 className="font-display font-semibold text-[15px] sm:text-lg leading-tight text-nb-ink dark:text-white">{w.name}</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{hostOf(w.url)}</p>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex-1 line-clamp-3 sm:line-clamp-none">{w.description}</p>
        <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-nb-ink dark:text-white">
          <span className="hidden sm:inline nb-flat rounded-full bg-nb-cream px-2.5 py-0.5 text-nb-ink truncate">{w.mapel}</span>
          <span className="inline-flex items-center gap-1 shrink-0 ml-auto">Buka <Icon name="arrow-up-right-from-square" /><span className="sr-only">(tab baru)</span></span>
        </div>
      </div>
    </a>
    <DetailSheet data={sheet.data} onClose={sheet.close} />
    </>
  );
}
