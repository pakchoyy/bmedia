"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import Icon from "./Icon";

const MAPEL_CATEGORIES = [
  { name: "Matematika", icon: "book", color: "#3b82f6" },
  { name: "Bahasa Indonesia", icon: "book-open", color: "#10b981" },
  { name: "IPAS", icon: "flask", color: "#8b5cf6" },
  { name: "Pendidikan Pancasila", icon: "book", color: "#ef4444" },
  { name: "Seni", icon: "photo-video", color: "#f59e0b" },
];

export default function PopularCategories() {
  return (
    <section id="categories" className="py-10 px-4">
      <div className="container mx-auto max-w-[1200px]">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-ink dark:text-slate-100 mb-3">
            Jelajahi berdasarkan kategori
          </h2>
          <p className="text-gray-600 dark:text-slate-400">
            Pilih kategori media yang Anda butuhkan
          </p>
        </div>

        {/* Tipe Media */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            Tipe Media
          </h3>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/catalog?kategori=${encodeURIComponent(cat.name)}`}
                className="group bg-white dark:bg-slate-900 hover:bg-primary-bg dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-5 py-3 flex items-center gap-3 transition-all hover:scale-105 hover:shadow-md"
              >
                <Icon name={cat.icon} className="text-xl group-hover:text-primary-light transition-colors" style={{ color: cat.color }} />
                <span className="font-semibold text-sm text-ink dark:text-slate-200">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mata Pelajaran */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            Mata Pelajaran
          </h3>
          <div className="flex flex-wrap gap-3">
            {MAPEL_CATEGORIES.map((mapel) => (
              <Link
                key={mapel.name}
                href={`/catalog?mapel=${encodeURIComponent(mapel.name)}`}
                className="group bg-white dark:bg-slate-900 hover:bg-primary-bg dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-5 py-3 flex items-center gap-3 transition-all hover:scale-105 hover:shadow-md"
              >
                <Icon name={mapel.icon} className="text-xl group-hover:text-primary-light transition-colors" style={{ color: mapel.color }} />
                <span className="font-semibold text-sm text-ink dark:text-slate-200">
                  {mapel.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-primary-light hover:text-primary font-semibold text-sm transition-colors"
          >
            Lihat Semua
            <Icon name="arrow-up-right-from-square" className="text-xs" />
          </Link>
        </div>
      </div>
    </section>
  );
}
