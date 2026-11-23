import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { CONTACT_WA, CONTACT_TIKTOK } from "@/lib/constants";
import UsulanForm from "@/components/UsulanForm";

export const metadata: Metadata = {
  title: {
    absolute: "Tentang & Saran · Main-yuk",
  },
  description:
    "Main-yuk adalah tempat untuk menemukan, menggunakan, dan berbagi media pembelajaran interaktif karya guru Indonesia.",
};

const values = [
  {
    icon: "users",
    title: "Karya Guru Indonesia",
    desc: "Media belajar dari karya guru Indonesia untuk saling berbagi dan menginspirasi.",
  },
  {
    icon: "laptop-code",
    title: "Belajar Lebih Interaktif",
    desc: "Temukan media yang membantu pembelajaran menjadi lebih menarik dan melibatkan siswa.",
  },
  {
    icon: "book-open",
    title: "Terbuka untuk Semua Guru",
    desc: "Media yang tersedia dapat dipakai untuk mendukung kegiatan pembelajaran di kelas.",
  },
];

export default function AboutPage() {
  return (
    <div className="fade-in">
      <div className="bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] py-10 text-center px-4">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-nb-ink dark:text-white">
          Tentang Main<span className="text-nb-orange">-yuk</span>
        </h1>
      </div>

      <div className="container mx-auto max-w-[1200px] px-6 py-6">
        <div className="max-w-[750px] mx-auto text-center space-y-3">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
            Main-yuk adalah tempat untuk menemukan, menggunakan, dan
            berbagi media pembelajaran interaktif karya guru Indonesia.
          </p>
          <p className="text-gray-600 leading-relaxed text-base">
            Di sini, guru dapat menemukan berbagai media belajar yang dapat digunakan
            untuk membantu pembelajaran menjadi lebih menarik, interaktif, dan mudah
            dipahami.
          </p>
          <p className="text-gray-600 leading-relaxed text-base">
            Media yang tersedia dapat berupa game edukasi, kuis interaktif, simulasi,
            bahan ajar digital, dan berbagai karya pembelajaran lainnya.
          </p>
        </div>

        <div className="grid gap-4 mt-6 grid-cols-1 md:grid-cols-3">
          {values.map((v) => (
            <div
              key={v.title}
              className="nb nb-hover bg-white dark:bg-slate-900 p-6 rounded-2xl text-center"
            >
              <span className="nb-sm w-14 h-14 rounded-xl bg-nb-yellow flex items-center justify-center mx-auto mb-3"><Icon name={v.icon} className="text-2xl text-nb-ink" /></span>
              <h3 className="font-display text-lg font-bold text-nb-ink dark:text-white mb-1.5">{v.title}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <section id="saran" className="mt-10 max-w-[700px] mx-auto scroll-mt-20" aria-labelledby="saran-judul">
          <h2 id="saran-judul" className="font-display text-2xl sm:text-3xl font-bold text-nb-ink dark:text-white text-center mb-1">Ulasan & <span className="nb-mark">Saran</span></h2>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-5">Tulis ulasan, usulkan game, atau laporkan kendala. Langsung dibaca Pak Choy.</p>
          <UsulanForm />
        </section>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 max-w-[700px] mx-auto">
          Kredit aset game: grafis latar dari <a href="https://kenney.nl" className="underline" target="_blank" rel="noopener noreferrer">Kenney</a> (CC0) ·
          emoji dari <a href="https://github.com/jdecked/twemoji" className="underline" target="_blank" rel="noopener noreferrer">Twemoji</a> oleh Twitter/X dan kontributor (CC-BY 4.0).
        </p>

        <div id="kontak" className="mt-8 nb bg-nb-yellow rounded-2xl p-6 max-w-[700px] mx-auto text-center">
          <h2 className="font-display text-2xl font-bold text-nb-ink mb-2">Hubungi Pak Choyy</h2>
          <p className="text-nb-ink/80 mb-4 text-sm">
            Ada data yang perlu diperbaiki atau ingin berbagi media? Hubungi Pak Choyy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={CONTACT_TIKTOK}
              target="_blank"
              rel="noreferrer"
              className="nb-sm nb-press inline-flex items-center gap-2 bg-nb-ink text-white px-5 py-3 rounded-xl text-sm font-extrabold"
            >
              <Icon name="tiktok" />
              TikTok Pak Choyy
            </a>
            <a
              href={`https://wa.me/62${CONTACT_WA.slice(1)}`}
              target="_blank"
              rel="noreferrer"
              className="nb-sm nb-press inline-flex items-center gap-2 bg-nb-mint text-nb-ink px-5 py-3 rounded-xl text-sm font-extrabold"
            >
              <Icon name="whatsapp" />
              WhatsApp Pak Choyy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}