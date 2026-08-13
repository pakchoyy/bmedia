"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Media } from "@/types/media";
import { CATEGORIES, JENJANG_OPTIONS } from "@/lib/constants";
import GameCard from "./GameCard";
import Icon from "./Icon";

const PAGE_SIZE = 12;

interface SearchFilterProps {
  media: Media[];
  initialCategory?: string;
  initialQuery?: string;
}

export default function SearchFilter({
  media,
  initialCategory = "",
  initialQuery = "",
}: SearchFilterProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string>(initialCategory);
  const [jenjang, setJenjang] = useState("");
  const [tool, setTool] = useState("");
  const [sort, setSort] = useState<"terbaru" | "populer">("terbaru");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const tools = useMemo(() => {
    const t = new Set<string>();
    media.forEach((m) => t.add(m.tool.trim()));
    return Array.from(t).sort((a, b) => a.localeCompare(b));
  }, [media]);

  const filtered = useMemo(() => {
    let list = [...media];

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.mapel.toLowerCase().includes(q) ||
          m.guru_name.toLowerCase().includes(q) ||
          m.jenjang.toLowerCase().includes(q)
      );
    }

    if (category) list = list.filter((m) => m.category === category);
    if (jenjang) list = list.filter((m) => m.jenjang === jenjang);
    if (tool) list = list.filter((m) => m.tool.trim().toLowerCase() === tool.toLowerCase());

    if (sort === "terbaru") {
      list = list.sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      );
    } else {
      list = list.sort((a, b) => b.plays - a.plays);
    }

    return list;
  }, [media, query, category, jenjang, tool, sort]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category, jenjang, tool, sort]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => c + PAGE_SIZE);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div>
      {/* Search + Filters */}
      <section className="px-4 mb-6 pt-4">
        <div className="container mx-auto max-w-[1200px]">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-full shadow-md px-8 py-4 max-w-[800px] mx-auto border border-gray-100 dark:border-slate-800 max-md:flex-col max-md:rounded-[15px] max-md:py-4 max-md:gap-3">
            <Icon name="magnifying-glass" className="text-primary-light text-xl shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul, mata pelajaran, guru, atau jenjang..."
              className="w-full bg-transparent outline-none text-base dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 justify-center mt-6">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-full text-sm font-medium bg-white dark:bg-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 outline-none focus:border-primary-light min-h-[44px]"
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={jenjang}
              onChange={(e) => setJenjang(e.target.value)}
              className="px-4 py-3 rounded-full text-sm font-medium bg-white dark:bg-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 outline-none focus:border-primary-light min-h-[44px]"
            >
              <option value="">Semua Jenjang</option>
              {JENJANG_OPTIONS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>

            <select
              value={tool}
              onChange={(e) => setTool(e.target.value)}
              className="px-4 py-3 rounded-full text-sm font-medium bg-white dark:bg-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 outline-none focus:border-primary-light min-h-[44px]"
            >
              <option value="">Semua Tool</option>
              {tools.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "terbaru" | "populer")}
              className="px-4 py-3 rounded-full text-sm font-medium bg-white dark:bg-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 outline-none focus:border-primary-light min-h-[44px]"
            >
              <option value="terbaru">Terbaru</option>
              <option value="populer">Terpopuler</option>
            </select>

            <span className="text-sm text-gray-500 dark:text-slate-400">
              {filtered.length} media
            </span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto max-w-[1200px] px-6 pb-10">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => (
            <GameCard key={m.id} media={m} />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Tidak ada media yang cocok dengan filter Anda.
          </p>
        )}

        <div ref={sentinelRef} className="h-4" />

        {visible.length < filtered.length && (
          <div className="text-center mt-6">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="bg-primary-light text-white px-8 py-3 rounded-full font-semibold hover:bg-primary transition-colors"
            >
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
