import Link from "next/link";
import Icon from "./Icon";
import { CATEGORIES } from "@/lib/constants";

const ICON_BG = ["bg-nb-mint", "bg-nb-orange", "bg-nb-lilac", "bg-nb-pink", "bg-nb-yellow", "bg-nb-mint", "bg-white"];

/** Baris kategori di beranda. "Game Custom Soal" tampil paling menonjol. */
export default function HomeCategories() {
  return (
    <section className="px-4 pt-8" aria-labelledby="kategori-judul">
      <div className="container mx-auto max-w-[1200px]">
        <h2 id="kategori-judul" className="font-display font-bold text-2xl sm:text-3xl text-nb-ink dark:text-white text-center mb-5">
          Pilih <span className="nb-mark">Kategori</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Kategori unggulan */}
          <Link
            href="/game"
            className="nb nb-hover nb-press col-span-2 sm:col-span-3 lg:col-span-2 rounded-2xl bg-nb-yellow text-nb-ink p-4 sm:p-5 flex items-center gap-4"
          >
            <span className="nb-sm shrink-0 w-14 h-14 rounded-xl bg-white flex items-center justify-center">
              <Icon name="gamepad" className="text-3xl" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="font-display font-bold text-xl sm:text-2xl leading-tight">Game Custom Soal</span>
                <span className="nb-flat rounded-full bg-nb-pink px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">Baru</span>
              </span>
              <span className="block text-sm font-semibold mt-0.5">Soalnya dibuat guru sendiri. Main bareng lewat kode kelas.</span>
            </span>
          </Link>

          {CATEGORIES.map((c, i) => (
            <Link
              key={c.name}
              href={`/catalog?kategori=${encodeURIComponent(c.name)}`}
              className="nb-sm nb-hover nb-press rounded-2xl bg-white dark:bg-slate-900 p-3 sm:p-4 flex items-center gap-3"
            >
              <span className={`nb-flat shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-nb-ink ${ICON_BG[i % ICON_BG.length]}`}>
                <Icon name={c.icon} className="text-lg" />
              </span>
              <span className="font-bold text-sm sm:text-[15px] leading-snug text-nb-ink dark:text-slate-100">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
