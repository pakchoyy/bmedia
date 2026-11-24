"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SheetAction = { label: string; href: string; tone?: "main" | "plain"; external?: boolean; onClick?: () => void };
export type SheetData = { key: string; title: string; cover?: React.ReactNode; badges?: string[]; desc?: string; steps?: string[]; meta?: string; actions: SheetAction[] };

/** Panel detail di tempat (bottom sheet di HP, modal di layar lebar). Tombol Kembali di HP menutup panel. */
export function useDetailSheet() {
  const [data, setData] = useState<SheetData | null>(null);
  const pushed = useRef(false);
  useEffect(() => {
    const onPop = () => { if (pushed.current) { pushed.current = false; setData(null); } };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const open = (d: SheetData) => {
    setData(d);
    if (!pushed.current) { history.pushState({ sheet: d.key }, "", `?lihat=${encodeURIComponent(d.key)}`); pushed.current = true; }
  };
  const close = () => { if (pushed.current) history.back(); else setData(null); };
  return { data, open, close };
}

export default function DetailSheet({ data, onClose }: { data: SheetData | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!data) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [data, onClose]);
  if (!data) return null;
  const btn = "nb-sm nb-press inline-flex items-center justify-center gap-2 rounded-xl min-h-[48px] px-4 font-extrabold text-nb-ink";
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-nb-ink/55 sheet-fade" onClick={onClose}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={data.title}
        className="relative w-full sm:max-w-[560px] max-h-[88vh] overflow-y-auto bg-white dark:bg-slate-900 border-[3px] border-nb-ink rounded-t-3xl sm:rounded-3xl shadow-[6px_6px_0_#1b1a3a] outline-none sheet-up"
        onClick={(e) => e.stopPropagation()}>
        <div className="sm:hidden mx-auto mt-2 h-1.5 w-12 rounded-full bg-slate-300" aria-hidden="true" />
        <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 z-10 w-11 h-11 rounded-full nb-sm bg-white text-nb-ink font-black text-lg">✕</button>
        {data.cover && <div className="aspect-video overflow-hidden border-b-[3px] border-nb-ink m-3 rounded-2xl nb-sm">{data.cover}</div>}
        <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3">
          <h2 className="font-display font-bold text-2xl text-nb-ink dark:text-white pr-12">{data.title}</h2>
          {!!data.badges?.length && (
            <div className="flex flex-wrap gap-1.5">
              {data.badges.map((b) => <span key={b} className="rounded-md border-2 border-nb-ink bg-nb-cream px-2 py-0.5 text-xs font-extrabold text-nb-ink">{b}</span>)}
            </div>
          )}
          {data.desc && <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">{data.desc}</p>}
          {!!data.steps?.length && (
            <div>
              <h3 className="font-extrabold text-sm text-nb-ink dark:text-white mb-1">Cara main</h3>
              <ol className="list-decimal pl-5 space-y-0.5 text-sm text-slate-700 dark:text-slate-300">{data.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </div>
          )}
          {data.meta && <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{data.meta}</p>}
          <div className="grid gap-2 pt-1">
            {data.actions.map((a) => (
              <a key={a.label} href={a.href} onClick={a.onClick} target={a.external ? "_blank" : undefined} rel={a.external ? "noopener noreferrer" : undefined}
                className={`${btn} ${a.tone === "main" ? "bg-nb-yellow text-lg" : "bg-white dark:bg-slate-800 dark:text-white"}`}>{a.label}</a>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
