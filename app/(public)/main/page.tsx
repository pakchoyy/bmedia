import type { Metadata } from "next";
import Link from "next/link";
import JoinCodeForm from "@/components/JoinCodeForm";

export const metadata: Metadata = { title: "Masuk Kelas" };

export default function MasukKelasPage({ searchParams }: { searchParams: { e?: string } }) {
  const err = searchParams.e === "notfound" ? "Kode tidak ditemukan. Periksa lagi kode dari gurumu." : "";
  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-10">
      <div className="w-full max-w-sm mx-auto nb bg-white dark:bg-slate-900 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-2">🎮</div>
        <h1 className="font-display text-3xl font-bold text-nb-ink dark:text-white">Masuk Kelas</h1>
        <p className="text-sm text-gray-500 mt-1 mb-5">Ketik kode dari gurumu (6 huruf/angka, atau 5 angka untuk Mabar), atau scan QR yang ditampilkan guru.</p>
        <JoinCodeForm initialError={err} />
        <p className="text-xs text-gray-400 mt-6">
          Tidak punya kode? <Link href="/game/kupu-kupu" className="font-semibold text-nb-orange">Latihan bebas</Link>
        </p>
      </div>
      <p className="text-center text-sm text-gray-500 mt-6">
        Anda guru? <Link href="/guru" className="font-semibold text-nb-orange">Buat soal untuk kelas Anda</Link>
      </p>
    </div>
  );
}
