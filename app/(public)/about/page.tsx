import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { CONTACT_WA, CONTACT_TIKTOK } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    absolute: "Tentang BGY - Media Belajar",
  },
  description:
    "BGY - Media Belajar adalah tempat untuk menemukan, menggunakan, dan berbagi media pembelajaran interaktif karya guru Indonesia.",
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
      <div className="bg-bgy-hero text-white py-8 text-center px-4">
        <h1 className="text-2xl md:text-3xl font-bold">Tentang BGY - Media Belajar</h1>
      </div>

      <div className="container mx-auto max-w-[1200px] px-6 py-6">
        <div className="max-w-[750px] mx-auto text-center space-y-3">
          <p className="text-gray-600 leading-relaxed text-base">
            BGY - Media Belajar adalah tempat untuk menemukan, menggunakan, dan
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
              className="bg-white p-6 rounded-xl text-center shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all"
            >
              <Icon name={v.icon} className="text-3xl mb-3 mx-auto text-primary-light" />
              <h3 className="text-base font-bold text-ink mb-1.5">{v.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <div id="kontak" className="mt-6 bg-pagebg rounded-2xl p-6 max-w-[700px] mx-auto text-center border border-gray-100">
          <h2 className="text-xl font-bold text-primary mb-2">Hubungi Pak Choyy</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Ada data yang perlu diperbaiki atau ingin berbagi media? Hubungi Pak Choyy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={CONTACT_TIKTOK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              <Icon name="tiktok" />
              TikTok Pak Choyy
            </a>
            <a
              href={`https://wa.me/62${CONTACT_WA.slice(1)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-success text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
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