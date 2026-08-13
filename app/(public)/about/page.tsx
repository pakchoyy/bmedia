import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { CONTACT_EMAIL, CONTACT_WA, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "BGY Interactive Learning — satu tempat untuk media pembelajaran interaktif karya guru Indonesia.",
};

const values = [
  {
    icon: "users",
    title: "Kolaborasi Guru",
    desc: "Setiap karya dikirim langsung oleh guru, untuk guru, demi mewujudkan merdeka belajar.",
  },
  {
    icon: "laptop-code",
    title: "Teknologi untuk Pendidikan",
    desc: "Membantu guru bekerja lebih mudah, cepat, dan terorganisir melalui pemanfaatan teknologi.",
  },
  {
    icon: "book-open",
    title: "Gratis & Terbuka",
    desc: "Seluruh media dapat diakses dan digunakan secara gratis oleh siapa saja.",
  },
];

export default function AboutPage() {
  return (
    <div className="fade-in">
      <div className="bg-bgy-hero text-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-3">Tentang BGY Interactive Learning</h1>
        <p className="opacity-90 max-w-2xl mx-auto">
          Satu Tempat untuk Media Pembelajaran Interaktif Guru Indonesia.
        </p>
      </div>

      <div className="container mx-auto max-w-[1200px] px-6 py-12">
        <div className="max-w-[850px] mx-auto text-center">
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            <strong className="text-primary">BGY (Bantu Guru Yuk)</strong> adalah
            ekosistem aplikasi pendidikan yang berfokus pada pemberdayaan guru.
            Melalui <strong className="text-primary">BGY Interactive Learning</strong>,
            kami menyediakan wadah berbagi inovasi digital bagi seluruh guru di
            Indonesia.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Kami mengumpulkan berbagai media pembelajaran interaktif yang dibuat
            langsung oleh guru — mulai dari game edukasi, quiz interaktif,
            laboratorium maya, hingga modul digital. Setiap karya melalui proses
            review admin sebelum dipublikasikan agar kualitasnya terjaga.
          </p>
        </div>

        <div className="grid gap-6 mt-12 grid-cols-1 md:grid-cols-3">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100 hover:-translate-y-1.5 hover:shadow-md transition-all"
            >
              <Icon name={v.icon} className="text-4xl mb-4 mx-auto text-primary-light" />
              <h3 className="text-lg font-bold text-ink mb-2">{v.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-pagebg rounded-2xl p-8 max-w-[700px] mx-auto text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-primary mb-4">Kontak Admin</h2>
          <p className="text-gray-600 mb-6">
            Punya pertanyaan, saran, atau ingin menghapus/melaporkan media?
            Hubungi kami melalui:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              <Icon name="envelope" />
              {CONTACT_EMAIL}
            </a>
            <a
              href={`https://wa.me/62${CONTACT_WA.slice(1)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-success text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Icon name="whatsapp" />
              {CONTACT_WA}
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Ekosistem BGY: <Link href={`https://${SITE_URL}`} target="_blank" className="text-primary-light underline">{SITE_URL}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
