import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { CONTACT_WA, CONTACT_TIKTOK } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    absolute: "Tentang Main-yuk",
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
    title: "Gratis & Terbuka",
    desc: "Media yang tersedia dapat digunakan secara gratis untuk mendukung kegiatan pembelajaran.",
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