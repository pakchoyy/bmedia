import type { Metadata } from "next";
import Link from "next/link";
import JoinCodeForm from "@/components/JoinCodeForm";

export const metadata: Metadata = { title: "Masuk Kelas | BGY" };

export default function MasukKelasPage({ searchParams }: { searchParams: { e?: string } }) {
  const err = searchParams.e === "notfound" ? "Kode tidak ditemukan. Periksa lagi kode dari gurumu." : "";
  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-10">
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-800 p-6 text-center">
        <div className="text-5xl mb-2">🎮</div>
        <h1 className="text-2xl font-extrabold text-primary dark:text-primary-light">Masuk Kelas</h1>
        <p className="text-sm text-gray-500 mt-1 mb-5">Ketik kode dari gurumu, atau scan QR yang ditampilkan guru.</p>
        <JoinCodeForm initialError={err} />
        <p className="text-xs text-gray-400 mt-6">
          Tidak punya kode? <Link href="/game/kupu-kupu" className="font-semibold text-primary-light">Latihan bebas</Link>
        </p>
      </div>
      <p className="text-center text-sm text-gray-500 mt-6">
        Anda guru? <Link href="/guru" className="font-semibold text-primary-light">Buat soal untuk kelas Anda</Link>
      </p>
    </div>
  );
}
