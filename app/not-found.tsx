import Link from "next/link";
import Icon from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-[1200px] px-6 py-16 text-center fade-in">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/maskot/sedih.webp" alt="" aria-hidden="true" className="w-40 sm:w-48 mx-auto mb-4" />
      <h1 className="font-display text-6xl font-bold text-nb-ink dark:text-white mb-2">4<span className="text-nb-orange">0</span>4</h1>
      <p className="text-lg text-slate-700 dark:text-slate-300 mb-8">
        Halaman yang kamu cari tidak ditemukan.
      </p>
      <Link href="/" className="nb nb-hover nb-press inline-flex items-center gap-2 bg-nb-orange text-nb-ink px-8 py-3 rounded-xl font-extrabold">
        <Icon name="arrow-left" /> Kembali ke Beranda
      </Link>
    </div>
  );
}
