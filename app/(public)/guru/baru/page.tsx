import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentGuru } from "@/lib/guru";
import { getGame } from "@/lib/games";
import { getSettings, coverKey } from "@/lib/settings";
import { createSet } from "../actions";
import Icon from "@/components/Icon";

export const metadata: Metadata = { title: "Buat Soal untuk Game" };
export const dynamic = "force-dynamic";

// Tujuan tombol ✏️ di kartu game: buat set soal yang langsung terhubung ke game itu
export default async function BuatSoalGamePage({ searchParams }: { searchParams: { game?: string } }) {
  const g = searchParams.game ? getGame(searchParams.game) : undefined;
  if (!g || g.noSet) redirect("/guru");
  const self = `/guru/baru?game=${g.slug}`;
  if (!(await getCurrentGuru())) redirect(`/guru/masuk?next=${encodeURIComponent(self)}`);
  const s = await getSettings();

  return (
    <div className="container mx-auto max-w-[640px] px-4 py-10">
      <div className="nb rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s[coverKey(g.slug)] || g.preview} alt="" className="w-full aspect-video object-cover border-b-[3px] border-nb-ink" />
        <div className="p-6">
          <p className="text-xs font-extrabold uppercase tracking-wider text-nb-orange">Custom soal</p>
          <h1 className="mt-1 font-display font-bold text-3xl text-nb-ink dark:text-white">Buat soal untuk {g.title}</h1>
          <ol className="mt-4 space-y-2 text-slate-700 dark:text-slate-300">
            <li><b>1.</b> Ketik soal, tempel dari WA/Word, atau unggah file Word/CSV.</li>
            <li><b>2.</b> Simpan, lalu bagikan kode atau QR ke murid.</li>
            <li><b>3.</b> Murid main {g.title} dengan soalmu, hasilnya masuk ke papan peringkat.</li>
          </ol>
          <form action={createSet.bind(null, g.slug)} className="mt-6">
            <button className="w-full nb nb-hover nb-press rounded-xl bg-nb-orange py-3 font-extrabold text-nb-ink inline-flex items-center justify-center gap-2">
              <Icon name="pen" /> Mulai buat soal
            </button>
          </form>
          <Link href="/guru" className="mt-3 block text-center text-sm font-bold text-slate-600 dark:text-slate-400 underline">Lihat set soal yang sudah ada</Link>
        </div>
      </div>
    </div>
  );
}
