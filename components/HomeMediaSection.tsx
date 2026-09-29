"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Media, MediaCategory } from "@/types/media";
import { JENJANG_OPTIONS, KELAS_OPTIONS, CATEGORIES } from "@/lib/constants";
import GameCard from "./GameCard";
import Icon from "./Icon";

const INITIAL_SHOW = 8;

const MAPEL_CHIPS = [
  { name: "Matematika", icon: "book", color: "#3b82f6" },
  { name: "Bahasa Indonesia", icon: "book-open", color: "#10b981" },
  { name: "IPAS", icon: "flask", color: "#8b5cf6" },
  { name: "Bahasa Inggris", icon: "globe", color: "#0ea5e9" },
  { name: "Informatika", icon: "laptop-code", color: "#6366f1" },
];

const MAPEL_NAMES = MAPEL_CHIPS.map((c) => c.name);
const MAPEL_LAINNYA = "__lainnya__";

const CATEGORY_COLORS: Record<MediaCategory, string> = {
  "Laboratorium Maya": "#0ea5a0",
  "Multimedia Interaktif": "#f59e0b",
  "Game Edukasi": "#10b981",
  "Quiz Interaktif": "#8b5cf6",
  "Modul Digital": "#3b82f6",
  "Video Pembelajaran Interaktif": "#e11d48",
  Lainnya: "#64748b",
};

interface HomeMediaSectionProps {
  media: Media[];
}

export default function HomeMediaSection({ media }: HomeMediaSectionProps) {
  const [query, setQuery] = useState("");
  const [jenjang, setJenjang] = useState("");
  const [kelas, setKelas] = useState("");
  const [mapel, setMapel] = useState("");
  const [kategori, setKategori] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return media.filter((m) => {
      if (q) {
        const haystack = `${m.title} ${m.mapel} ${m.guru_name} ${m.kelas} ${m.tool} ${m.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (jenjang && m.jenjang !== jenjang) return false;
      if (kelas && m.kelas !== kelas) return false;
      if (mapel === MAPEL_LAINNYA) {
        if (MAPEL_NAMES.includes(m.mapel)) return false;
      } else if (mapel && m.mapel !== mapel) return false;
      if (kategori && m.category !== kategori) return false;
      return true;
    });
  }, [media, query, jenjang, kelas, mapel, kategori]);

  const isFiltering = !!query || !!jenjang || !!kelas || !!mapel || !!kategori;
  const isLainnya = mapel === MAPEL_LAINNYA;
  const showAll = isFiltering;
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);
  const hasMore = !showAll && filtered.length > INITIAL_SHOW;

  return (
    <section className="px-4 pt-5 pb-6">
      <div className="container mx-auto max-w-[1200px]">
        {/* Search + filters */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-3 mb-4 mx-auto max-w-[720px]">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="magnifying-glass" className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul, guru, mapel..."
              className="flex-1 bg-transparent outline-none text-sm dark:text-slate-100 placeholder:text-gray-400"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                <Icon name="xmark" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <select
              value={jenjang}
              onChange={(e) => { setJenjang(e.target.value); setKelas(""); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 outline-none"
            >
              <option value="">Semua Jenjang</option>
              {JENJANG_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 outline-none"
            >
              <option value="">Semua Kelas</option>
              {KELAS_OPTIONS
                .filter((k) => !jenjang || k.group.includes(jenjang) || (jenjang === "Umum" && !k.group))
                .map((k) => <option key={k.label} value={k.label}>{k.label}</option>)}
            </select>
            <select
              value={mapel}
              onChange={(e) => setMapel(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 outline-none"
            >
              <option value="">Semua Mapel</option>
              {Array.from(new Set(media.map((m) => m.mapel))).sort().map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 outline-none"
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            {isFiltering && (
              <button
                onClick={() => { setQuery(""); setJenjang(""); setKelas(""); setMapel(""); setKategori(""); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-danger border border-danger/30 hover:bg-danger/10 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Mata Pelajaran chips */}
        <div className="mb-4 text-center">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            <button
              onClick={() => setMapel("")}
              className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border transition-all ${
                mapel === ""
                  ? "bg-primary-bg border-primary-light text-primary scale-105 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-ink dark:text-slate-200 hover:border-primary-light"
              }`}
            >
              Semua
            </button>
            {MAPEL_CHIPS.map((chip) => (
              <button
                key={chip.name}
                onClick={() => setMapel(mapel === chip.name ? "" : chip.name)}
                className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border transition-all ${
                  mapel === chip.name
                    ? "bg-primary-bg border-primary-light text-primary scale-105 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-ink dark:text-slate-200 hover:border-primary-light"
                }`}
              >
                {chip.name}
              </button>
            ))}
            <button
              onClick={() => setMapel(isLainnya ? "" : MAPEL_LAINNYA)}
              className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border transition-all ${
                isLainnya
                  ? "bg-primary-bg border-primary-light text-primary scale-105 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-ink dark:text-slate-200 hover:border-primary-light"
              }`}
            >
              Lainnya
            </button>
          </div>
        </div>

        {/* Media heading */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-ink dark:text-slate-100">
            {isFiltering ? "Hasil Pencarian" : "Media Terbaru"}
          </h2>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {filtered.length} media
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="magnifying-glass" className="text-4xl text-gray-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              {isFiltering ? "Tidak ada media yang cocok dengan filter." : "Belum ada media."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((m) => (
                <GameCard key={m.id} media={m} categoryColor={CATEGORY_COLORS[m.category]} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-6">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 bg-primary-light text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary transition-colors shadow-sm"
                >
                  Lihat Semua Media
                  <Icon name="arrow-right" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
