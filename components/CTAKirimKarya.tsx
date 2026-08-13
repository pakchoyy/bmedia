import Link from "next/link";
import Icon from "./Icon";

export default function CTAKirimKarya() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-[900px] text-center">
        <div className="bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 rounded-2xl p-10 max-md:p-6 border border-accent/20">
          <Icon name="cloud-arrow-up" className="text-5xl text-accent mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-ink dark:text-slate-100 mb-3">
            Punya media pembelajaran sendiri?
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-300 mb-6 max-w-[600px] mx-auto">
            Bagikan karya kamu dan bantu guru lainnya. Media Anda akan ditinjau terlebih dahulu sebelum dipublikasikan.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 bg-accent hover:bg-[#e06c0d] text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-md"
          >
            <Icon name="plus" />
            Kirim Karya
          </Link>
        </div>
      </div>
    </section>
  );
}
