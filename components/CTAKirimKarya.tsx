import Link from "next/link";
import Icon from "./Icon";

export default function CTAKirimKarya() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 p-8 max-md:p-6 border border-accent/20">
      <Icon name="cloud-arrow-up" className="text-5xl text-accent mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-ink dark:text-slate-100 mb-3">
        Punya media pembelajaran sendiri?
      </h2>
      <p className="text-lg text-gray-600 dark:text-slate-300 mb-6 max-w-[440px] leading-relaxed">
        Bagikan karya kamu dan bantu guru lainnya. Media Anda akan ditinjau terlebih dahulu sebelum dipublikasikan.
      </p>
      <Link
        href="/submit"
        className="inline-flex items-center gap-2 bg-accent hover:bg-[#e06c0d] text-white px-8 py-3.5 rounded-full font-bold transition-all hover:scale-105 shadow-md"
      >
        <Icon name="plus" />
        Kirim Karya
      </Link>
    </div>
  );
}
