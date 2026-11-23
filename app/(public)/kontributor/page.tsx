import type { Metadata } from "next";
import Link from "next/link";
import { getKontributor } from "@/lib/queries";
import WaGroupButton from "@/components/WaGroupButton";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "Kontributor",
  description: "Guru-guru yang berbagi karya di Main-yuk. Terima kasih sudah menginspirasi!",
};
export const dynamic = "force-dynamic";

const WARNA = ["bg-nb-yellow", "bg-nb-mint", "bg-nb-pink", "bg-nb-lilac", "bg-nb-orange"];

export default async function KontributorPage() {
  const list = await getKontributor();
  const totalKarya = list.reduce((a, k) => a + k.karya, 0);

  return (
    <div className="fade-in pb-12">
      <div className="bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] py-10 text-center px-4">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-nb-ink dark:text-white">
          Para <span className="nb-mark">Kontributor</span>
        </h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
          {list.length} guru telah berbagi {totalKarya} karya. Terima kasih sudah membantu guru lain mengajar lebih seru.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/submit" className="nb nb-hover nb-press bg-nb-orange text-nb-ink font-extrabold rounded-xl px-5 py-3 inline-flex items-center gap-2">
            <Icon name="plus" /> Kirim Karyamu
          </Link>
          <WaGroupButton className="py-3" />
        </div>
      </div>

      <div className="container mx-auto max-w-[1100px] px-4 py-8">
        {list.length === 0 ? (
          <p className="text-center text-slate-600">Belum ada kontributor.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((k, i) => (
              <li key={k.name}>
                <Link href={`/catalog?q=${encodeURIComponent(k.name)}`}
                  className="nb nb-hover nb-press block rounded-2xl bg-white dark:bg-slate-900 p-4 h-full">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className={`nb-flat shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-xl text-nb-ink ${WARNA[i % WARNA.length]}`}>
                      {k.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display font-semibold text-lg text-nb-ink dark:text-white leading-tight truncate">{k.name}</h2>
                      {k.sekolah && <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{k.sekolah}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 text-xs font-bold text-nb-ink dark:text-white">
                    <span className="nb-flat rounded-full bg-nb-yellow/40 px-2.5 py-1">{k.karya} karya</span>
                    <span className="nb-flat rounded-full bg-nb-mint/30 px-2.5 py-1">dibuka {k.dibuka}×</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-8 text-center text-xs text-slate-500 max-w-xl mx-auto">
          Seluruh karya dimiliki pembuatnya. Main-yuk hanya menautkan dan memamerkannya. Ingin karyamu diubah atau dihapus? Hubungi Pak Choy.
        </p>
      </div>
    </div>
  );
}
