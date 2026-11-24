import type { Metadata } from "next";
import Link from "next/link";
import JoinCodeForm from "@/components/JoinCodeForm";
import { MAIN_GAMES, type Cara } from "@/lib/games";

export const metadata: Metadata = { title: "Mabar Yuk", description: "Main bareng teman sekelas: masukkan kode dari guru, main di layar kelas, atau Mabar Online." };

const CARA: { key: Cara; icon: string; title: string; desc: string; color: string }[] = [
  { key: "online", icon: "🌐", title: "Mabar Online", desc: "Satu kelas main bersamaan di HP masing-masing. Guru memulai, papan skor langsung tampil.", color: "bg-[#38a3ff]" },
  { key: "ifp", icon: "🖥️", title: "Layar Kelas (IFP)", desc: "1–4 anak berhadapan di satu layar besar. Buka game di IFP, pilih jumlah pemain.", color: "bg-nb-yellow" },
  { key: "sendiri", icon: "🙋", title: "Main Sendiri", desc: "Latihan bebas tanpa kode, kapan saja di HP atau laptop.", color: "bg-[#22c55e]" },
];

export default function MabarPage({ searchParams }: { searchParams: { e?: string } }) {
  const err = searchParams.e === "notfound" ? "Kode tidak ditemukan. Periksa lagi kode dari gurumu." : "";
  return (
    <div className="fade-in px-4 py-8 sm:py-10">
      <div className="container mx-auto max-w-[1100px]">
        {/* Kode dari guru */}
        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr] items-center" aria-labelledby="kode-judul">
          <div className="max-lg:text-center">
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-nb-ink dark:text-white">Mabar <span className="nb-mark">Yuk</span></h1>
            <p className="mt-2 text-slate-700 dark:text-slate-300">Main bareng teman sekelas. Punya kode dari guru? Ketik di sini.</p>
            <ul className="mt-4 space-y-2 text-sm font-bold text-nb-ink dark:text-white max-lg:inline-block max-lg:text-left">
              <li className="flex items-center gap-2"><span className="rounded-md border-2 border-nb-ink bg-[#38a3ff] px-2 py-0.5 font-display">12345</span> 5 angka = <b>Mabar Online</b></li>
              <li className="flex items-center gap-2"><span className="rounded-md border-2 border-nb-ink bg-nb-yellow px-2 py-0.5 font-display">ABC123</span> 6 huruf/angka = <b>Tugas dari Guru</b></li>
            </ul>
          </div>
          <div id="kode" className="relative nb bg-white dark:bg-slate-900 rounded-2xl p-6 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/maskot/halo.webp" alt="" aria-hidden="true" className="hidden lg:block absolute -top-12 -right-4 w-28 rotate-6 pointer-events-none" />
            <h2 id="kode-judul" className="font-display text-2xl font-bold text-nb-ink dark:text-white mb-1">Punya kode?</h2>
            <p className="text-sm text-slate-500 mb-4">Ketik kode atau scan QR yang ditampilkan guru.</p>
            <JoinCodeForm initialError={err} />
          </div>
        </section>

        {/* 3 cara main */}
        <section className="mt-12" aria-labelledby="cara-judul">
          <h2 id="cara-judul" className="font-display font-bold text-2xl sm:text-3xl text-nb-ink dark:text-white">Pilih cara <span className="nb-mark">main</span></h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {CARA.map((c) => {
              const games = MAIN_GAMES.filter((g) => g.cara.includes(c.key));
              return (
                <div key={c.key} className="nb rounded-2xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
                  <div className={`${c.color} border-b-[3px] border-nb-ink px-4 py-3 flex items-center gap-2`}>
                    <span className="text-2xl" aria-hidden="true">{c.icon}</span>
                    <h3 className="font-display font-bold text-xl text-nb-ink">{c.title}</h3>
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{c.desc}</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {games.map((g) => (
                        <li key={g.slug}><Link href={c.key === "online" ? `/?lihat=${g.slug}` : `/game/${g.slug}`} className="inline-block rounded-full border-2 border-nb-ink bg-nb-cream dark:bg-slate-800 px-2.5 py-0.5 text-xs font-extrabold text-nb-ink dark:text-white hover:bg-nb-yellow">{g.title}</Link></li>
                      ))}
                    </ul>
                    {c.key === "online" && <p className="mt-auto text-xs font-bold text-slate-500">Butuh kode 5 angka dari guru → ketik di kotak “Punya kode?” di atas.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Untuk guru */}
        <section className="mt-12 nb rounded-2xl bg-nb-lilac/25 dark:bg-slate-900 p-5 sm:p-6" aria-labelledby="guru-judul">
          <h2 id="guru-judul" className="font-display font-bold text-2xl text-nb-ink dark:text-white">Untuk guru: cara mengadakan Mabar Online</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              "Buat set soal di Ruang Guru (ketik, tempel, atau unggah Word/CSV).",
              "Di halaman set soal, pilih game di bagian “Mulai Mabar Online”: Tangkap Kupu, Balon Pecah, atau Gowes.",
              "Tampilkan kode 5 angka/QR di IFP. Setelah murid masuk, tekan Mulai dan pantau papan skor langsung.",
            ].map((t, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-nb-ink p-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-nb-orange border-2 border-nb-ink flex items-center justify-center font-display font-bold text-nb-ink">{i + 1}</span>
                <span className="text-sm text-slate-800 dark:text-slate-200">{t}</span>
              </li>
            ))}
          </ol>
          <Link href="/guru" className="mt-4 nb nb-hover nb-press inline-flex items-center gap-2 rounded-xl bg-nb-orange px-5 py-2.5 font-extrabold text-nb-ink">Buka Ruang Guru →</Link>
        </section>
      </div>
    </div>
  );
}
