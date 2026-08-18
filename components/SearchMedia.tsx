"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { CATEGORIES, JENJANG_OPTIONS, KELAS_OPTIONS } from "@/lib/constants";

const MAPEL_OPTIONS = ["Matematika", "Bahasa Indonesia", "IPAS", "Bahasa Inggris", "Pendidikan Pancasila", "PJOK", "Seni"];
const TIPE_OPTIONS = CATEGORIES.map((c) => c.name);

export default function SearchMedia() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [jenjang, setJenjang] = useState("");
  const [kelas, setKelas] = useState("");
  const [mapel, setMapel] = useState("");
  const [tipe, setTipe] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (jenjang && jenjang !== "Semua") params.set("jenjang", jenjang);
    if (kelas && kelas !== "Semua") params.set("kelas", kelas);
    if (mapel && mapel !== "Semua") params.set("mapel", mapel);
    if (tipe) params.set("kategori", tipe);
    router.push(`/catalog?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section id="search" className="py-4 px-4 bg-pagebg dark:bg-slate-950">
      <div className="container mx-auto max-w-[1100px] px-2">
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold text-ink dark:text-slate-100 mb-1.5">
            Cari Media Belajar
          </h2>
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            Temukan media pembelajaran yang sesuai kebutuhan kelas Anda
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 rounded-xl px-5 py-3.5 mb-4">
            <Icon name="magnifying-glass" className="text-primary-light text-2xl shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari media pembelajaran..."
              className="flex-1 bg-transparent outline-none text-base dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
            <button
              onClick={handleSearch}
              className="bg-accent text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#e06c0d] transition-colors shrink-0"
            >
              Cari
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={jenjang}
              onChange={(e) => setJenjang(e.target.value)}
              className="px-4 py-3 rounded-lg text-sm font-medium bg-gray-50 dark:bg-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 outline-none focus:border-primary-light transition-colors"
            >
              <option value="">Semua Jenjang</option>
              {JENJANG_OPTIONS.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>

            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="px-4 py-3 rounded-lg text-sm font-medium bg-gray-50 dark:bg-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 outline-none focus:border-primary-light transition-colors"
            >
              <option value="">Semua Kelas</option>
              {KELAS_OPTIONS.map((k) => (
                <option key={k.label} value={k.label}>{k.label}</option>
              ))}
            </select>

            <select
              value={mapel}
              onChange={(e) => setMapel(e.target.value)}
              className="px-4 py-3 rounded-lg text-sm font-medium bg-gray-50 dark:bg-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 outline-none focus:border-primary-light transition-colors"
            >
              <option value="">Semua Mata Pelajaran</option>
              {MAPEL_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={tipe}
              onChange={(e) => setTipe(e.target.value)}
              className="px-4 py-3 rounded-lg text-sm font-medium bg-gray-50 dark:bg-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 outline-none focus:border-primary-light transition-colors"
            >
              <option value="">Semua Tipe Media</option>
              {TIPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
