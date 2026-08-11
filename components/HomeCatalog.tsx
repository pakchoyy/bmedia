"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Media } from "@/types/media";
import { CATEGORIES } from "@/lib/constants";
import GameCard from "./GameCard";
import CategoryCard from "./CategoryCard";
import TrendingSidebar from "./TrendingSidebar";
import Stats from "./Stats";
import Icon from "./Icon";
import type { SiteStats } from "@/lib/queries";

type QuickFilter =
  | "Semua"
  | "TK/PAUD"
  | "SD"
  | "SMP"
  | "SMA/SMK"
  | "Terbaru"
  | "Populer";

const QUICK_FILTERS: QuickFilter[] = [
  "Semua",
  "TK/PAUD",
  "SD",
  "SMP",
  "SMA/SMK",
  "Terbaru",
  "Populer",
];

const PREVIEW_LIMIT = 12;

export default function HomeCatalog({
  media,
  trending,
  stats,
}: {
  media: Media[];
  trending: Media[];
  stats: SiteStats;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<QuickFilter>("Semua");

  const filtered = useMemo(() => {
    let list = [...media];

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.mapel.toLowerCase().includes(q) ||
          m.guru_name.toLowerCase().includes(q)
      );
    }

    switch (filter) {
      case "SD":
        list = list.filter((m) => m.jenjang === "SD");
        break;
      case "SMP":
        list = list.filter((m) => m.jenjang === "SMP");
        break;
      case "SMA/SMK":
        list = list.filter(
          (m) => m.jenjang === "SMA" || m.jenjang === "SMK"
        );
        break;
      case "TK/PAUD":
        list = list.filter(
          (m) =>
            m.kelas.toLowerCase().includes("tk") ||
            m.kelas.toLowerCase().includes("paud")
        );
        break;
      case "Terbaru":
        list = list.sort(
          (a, b) =>
            new Date(b.submitted_at).getTime() -
            new Date(a.submitted_at).getTime()
        );
        break;
      case "Populer":
        list = list.sort((a, b) => b.plays - a.plays);
        break;
      default:
        break;
    }

    return list;
  }, [media, query, filter]);

  const visible = filtered.slice(0, PREVIEW_LIMIT);

  return (
    <div>
      {/* Search & Quick Filters */}
      <section className="px-4 mb-8 pt-4">
        <div className="container mx-auto max-w-[1200px]">
          <div className="flex items-center gap-4 bg-white rounded-full shadow-md px-8 py-4 max-w-[800px] mx-auto border border-gray-100 max-md:flex-col max-md:rounded-[15px] max-md:py-4 max-md:gap-3">
            <Icon name="magnifying-glass" className="text-primary-light text-xl shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari media pembelajaran, guru, mata pelajaran, atau jenjang..."
              className="w-full bg-transparent outline-none text-base"
            />
            <button className="bg-accent text-white rounded-full px-6 py-2.5 text-base font-semibold shrink-0 hover:bg-[#e06c0d] transition-colors">
              Cari
            </button>
          </div>

          <div className="flex gap-2.5 justify-center mt-6 flex-wrap">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-primary-light text-white border-primary-light"
                    : "bg-white text-ink border border-gray-300 hover:bg-primary-light hover:text-white hover:border-primary-light"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-12">
        <div className="container mx-auto max-w-[1200px] px-6">
          <h2 className="section-title">Kategori Pembelajaran</h2>
          <div className="grid gap-6 mt-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.name} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Catalog + Trending */}
      <section id="catalog" className="py-8">
        <div className="container mx-auto max-w-[1200px] px-6 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-primary font-bold text-[2rem] text-left mb-6">
                Koleksi Media Terbaru
              </h2>
              <Link
                href="/catalog"
                className="text-primary-light font-semibold text-sm hover:text-primary shrink-0 mb-6"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {visible.map((m) => (
                <GameCard key={m.id} media={m} />
              ))}
            </div>
            {visible.length === 0 && (
              <p className="text-center text-gray-500 py-10">
                Tidak ada media yang cocok dengan pencarian Anda.
              </p>
            )}
            <div className="text-center mt-10">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-primary-light text-white px-8 py-3 rounded-full font-semibold hover:bg-primary transition-colors"
              >
                Buka Katalog Lengkap
                <Icon name="arrow-up-right-from-square" className="text-sm" />
              </Link>
            </div>
          </div>

          <TrendingSidebar media={trending} />
        </div>
      </section>

      {/* Stats */}
      <Stats stats={stats} />
    </div>
  );
}
