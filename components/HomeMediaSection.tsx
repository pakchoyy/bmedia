"use client";

import { useState, useMemo } from "react";
import type { Media, MediaCategory } from "@/types/media";
import { JENJANG_OPTIONS, KELAS_OPTIONS, CATEGORIES } from "@/lib/constants";
import GameCard from "./GameCard";
import Icon from "./Icon";

const MAPEL_CHIPS = [
  { name: "Matematika", icon: "book", color: "#3b82f6" },
  { name: "Bahasa Indonesia", icon: "book-open", color: "#10b981" },
  { name: "IPAS", icon: "flask", color: "#8b5cf6" },
  { name: "Pendidikan Pancasila", icon: "book", color: "#ef4444" },
  { name: "Seni", icon: "photo-video", color: "#f59e0b" },
];

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
      if (mapel && m.mapel !== mapel) return false;
      if (kategori && m.category !== kategori) return false;
      return true;
    });
  }, [media, query, jenjang, kelas, mapel, kategori]);

  const isFiltering = !!query || !!jenjang || !!kelas || !!mapel || !!kategori;

  return (
    <section className="px-4 pb-6">
      <div className="container mx-auto max-w-[1200px]">
        {/* Search + filters — compact inline */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-3 mb-4">
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
          <div className="flex flex-wrap gap-2">
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
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Berdasarkan Mata Pelajaran
          </h3>
          <div className="flex flex-wrap gap-2">
            {MAPEL_CHIPS.map((chip) => (
              <button
                key={chip.name}
                onClick={() => setMapel(mapel === chip.name ? "" : chip.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  mapel === chip.name
                    ? "bg-primary-bg border-primary-light text-primary scale-105 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-ink dark:text-slate-200 hover:border-primary-light hover:shadow-sm"
                }`}
              >
                <Icon name={chip.icon} className="text-sm" style={{ color: chip.color }} />
                {chip.name}
              </button>
            ))}
          </div>
        </div>

        {/* Media grid */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-ink dark:text-slate-100">
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((m) => (
              <GameCard key={m.id} media={m} categoryColor={CATEGORY_COLORS[m.category]} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
