import type { Metadata } from "next";
import { WEB_LUAR } from "@/lib/links";
import WebLuarCard from "@/components/WebLuarCard";

export const metadata: Metadata = {
  title: "Web Belajar Lain",
  description: "Rekomendasi web belajar gratis pilihan Main-yuk: alat peraga maya, simulasi IPA, coding, dan lainnya.",
};

export default function WebBelajarPage() {
  return (
    <div className="fade-in pb-12">
      <div className="bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] py-10 text-center px-4">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-nb-ink dark:text-white">
          Web Belajar <span className="nb-mark">Lain</span>
        </h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
          Web gratis pilihan Pak Choy untuk melengkapi pembelajaran. Semuanya dibuka di tab baru.
        </p>
      </div>
      <div className="container mx-auto max-w-[1100px] px-4 py-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WEB_LUAR.map((w) => <li key={w.url}><WebLuarCard w={w} /></li>)}
        </ul>
        <p className="mt-8 text-center text-xs text-slate-500 max-w-xl mx-auto">
          Web di atas dikelola pihak ketiga, bukan Main-yuk. Main-yuk hanya menautkan dan tidak bertanggung jawab atas isinya.
        </p>
      </div>
    </div>
  );
}
