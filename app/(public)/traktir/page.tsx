import type { Metadata } from "next";
import { TRAKTIR_OPSI } from "@/lib/constants";
import WaGroupButton from "@/components/WaGroupButton";

export const metadata: Metadata = {
  title: "Traktir Pak Choy",
  description: "Dukung Main-yuk agar terus menambah game edukasi untuk guru dan murid Indonesia.",
};

const WARNA = ["bg-nb-yellow", "bg-nb-mint", "bg-nb-pink"];

export default function TraktirPage() {
  return (
    <div className="fade-in pb-12">
      <div className="bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] py-10 text-center px-4">
        <div className="text-5xl" aria-hidden="true">☕</div>
        <h1 className="mt-2 font-display font-bold text-3xl sm:text-5xl text-nb-ink dark:text-white">
          Traktir <span className="nb-mark">Pak Choy</span>
        </h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
          Main-yuk dibuat dan dirawat sendiri oleh Pak Choy. Traktiranmu dipakai untuk biaya server dan membuat game baru.
        </p>
      </div>
      <div className="container mx-auto max-w-[900px] px-4 py-8">
        <ul className="grid gap-4 sm:grid-cols-3">
          {TRAKTIR_OPSI.map((o, i) => (
            <li key={o.url}>
              <a href={o.url} target="_blank" rel="noopener noreferrer"
                className="nb nb-hover nb-press rounded-2xl bg-white dark:bg-slate-900 p-5 flex flex-col items-center text-center gap-2 h-full">
                <span aria-hidden="true" className={`nb-flat w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${WARNA[i % WARNA.length]}`}>{o.emoji}</span>
                <span className="font-display font-bold text-xl text-nb-ink dark:text-white">{o.label}</span>
                <span className="font-extrabold text-2xl text-nb-orange">{o.harga}</span>
                <span className="mt-1 w-full rounded-xl bg-nb-orange border-2 border-nb-ink py-2 font-extrabold text-nb-ink">Traktir <span className="sr-only">(tab baru)</span></span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Pembayaran lewat toko <b>Kreasi Pak Choy</b> (kreacy.my.id): QRIS, e-wallet, atau transfer bank.
        </p>
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">Tidak sempat traktir? Bantu dengan usulan game dan cerita pemakaian di kelas.</p>
          <WaGroupButton />
        </div>
      </div>
    </div>
  );
}
