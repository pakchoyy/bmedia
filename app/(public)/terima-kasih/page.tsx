import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata: Metadata = { title: "Terima Kasih", robots: { index: false } };

export default function TerimaKasihPage() {
  return (
    <div className="fade-in px-4 py-16">
      <div className="nb rounded-2xl bg-white dark:bg-slate-900 max-w-[560px] mx-auto p-8 text-center">
        <div className="text-6xl" aria-hidden="true">🙏</div>
        <h1 className="mt-3 font-display font-bold text-3xl text-nb-ink dark:text-white">
          Terima kasih <span className="nb-mark">banyak!</span>
        </h1>
        <p className="mt-3 text-slate-700 dark:text-slate-300">
          Traktiranmu sudah sampai ke Pak Choy. Dukunganmu membantu Main-yuk tetap jalan dan terus menambah game baru untuk murid Indonesia.
        </p>
        <Link href="/" className="mt-6 nb nb-hover nb-press inline-flex items-center gap-2 rounded-xl bg-nb-orange px-5 py-3 font-extrabold text-nb-ink">
          <Icon name="play" /> Kembali main
        </Link>
      </div>
    </div>
  );
}
