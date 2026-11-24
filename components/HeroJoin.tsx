"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import JoinCodeForm from "./JoinCodeForm";

/** Tombol hero "Masuk Kelas": buka kotak kode dari guru tanpa pindah halaman. */
export default function HeroJoin() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="nb nb-hover nb-press bg-nb-orange text-nb-ink font-extrabold rounded-xl px-3 sm:px-5 py-2.5 sm:py-3 text-[15px] sm:text-base whitespace-nowrap inline-flex items-center justify-center gap-2">
        <Icon name="graduation-cap" /> Masuk Kelas
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-nb-ink/55 sheet-fade" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Masuk kelas" onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-[420px] bg-white dark:bg-slate-900 border-[3px] border-nb-ink rounded-t-3xl sm:rounded-3xl shadow-[6px_6px_0_#1b1a3a] p-5 sheet-up text-left">
            <button onClick={() => setOpen(false)} aria-label="Tutup" className="absolute right-3 top-3 w-11 h-11 rounded-full nb-sm bg-white text-nb-ink font-black text-lg">✕</button>
            <h2 className="font-display font-bold text-2xl text-nb-ink dark:text-white pr-12">🏫 Masuk Kelas</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-3">Ketik kode dari gurumu, lalu main dengan soal kelasmu.</p>
            <JoinCodeForm />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
