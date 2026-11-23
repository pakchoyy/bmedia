import type { Metadata } from "next";
import Link from "next/link";
import { getWebLinks, WEB_KATEGORI } from "@/lib/links";
import WebLuarCard from "@/components/WebLuarCard";

export const metadata: Metadata = {
  title: "Web Belajar Lain",
  description: "Rekomendasi platform belajar pihak ketiga untuk kelas dan IFP: pembuat kuis, simulasi 3D, latihan matematika, dan kolaborasi.",
};
export const dynamic = "force-dynamic";

export default async function WebBelajarPage({ searchParams }: { searchParams: { k?: string } }) {
  const all = await getWebLinks();
  const kats = WEB_KATEGORI.filter((k) => all.some((w) => w.kategori === k));
  const aktif = kats.includes(searchParams.k ?? "") ? searchParams.k! : "";
  const links = aktif ? all.filter((w) => w.kategori === aktif) : all;
  const groups = aktif ? [aktif] : kats;

  const chip = (label: string, href: string, on: boolean, n: number) => (
    <Link key={label} href={href} scroll={false} aria-current={on ? "page" : undefined}
      className={`nb-sm nb-press rounded-full px-3.5 py-1.5 text-sm font-extrabold ${on ? "bg-nb-yellow text-nb-ink" : "bg-white dark:bg-slate-900 text-nb-ink dark:text-white"}`}>
      {label} <span className="opacity-60">{n}</span>
    </Link>
  );

  return (
    <div className="fade-in pb-12">
      <div className="bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] py-10 text-center px-4">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-nb-ink dark:text-white">
          Web Belajar <span className="nb-mark">Lain</span>
        </h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
          Platform pilihan untuk melengkapi pembelajaran di kelas dan IFP. Semuanya dibuka di tab baru.
        </p>
      </div>
      <div className="container mx-auto max-w-[1200px] px-4 py-6">
        <nav aria-label="Kategori" className="flex flex-wrap gap-2 justify-center">
          {chip("Semua", "/web-belajar", !aktif, all.length)}
          {kats.map((k) => chip(k, `/web-belajar?k=${encodeURIComponent(k)}`, aktif === k, all.filter((w) => w.kategori === k).length))}
        </nav>
        {groups.map((g) => {
          const items = links.filter((w) => w.kategori === g);
          if (!items.length) return null;
          return (
            <section key={g} className="mt-8" aria-labelledby={`k-${g}`}>
              <h2 id={`k-${g}`} className="font-display font-bold text-2xl text-nb-ink dark:text-white mb-4">{g}</h2>
              <ul className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
                {items.map((w, i) => <li key={w.id}><WebLuarCard w={w} i={i} /></li>)}
              </ul>
            </section>
          );
        })}
        <p className="mt-10 text-center text-xs text-slate-500 max-w-xl mx-auto">
          Web di atas dikelola pihak ketiga, bukan Main-yuk. Main-yuk hanya menautkan dan tidak bertanggung jawab atas isi maupun biayanya.
        </p>
      </div>
    </div>
  );
}
