import Link from "next/link";
import Icon from "./Icon";

export default function CTABuatGame() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center rounded-2xl border border-primary-light/20 bg-gradient-to-br from-primary/5 to-primary-light/5 dark:from-primary/10 dark:to-primary-light/10 p-8 max-md:p-6">
      <Icon name="gamepad" className="text-5xl text-primary-light mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-ink dark:text-slate-100 mb-3">
        Punya ide media sendiri?
      </h2>
      <p className="text-lg text-gray-600 dark:text-slate-300 mb-6 max-w-[440px] leading-relaxed">
        Buat game edukasi tanpa harus coding. Gunakan AI untuk menghasilkan media pembelajaran interaktif dalam hitungan menit.
      </p>
      <Link
        href="/buat"
        className="inline-flex items-center gap-2 bg-primary-light hover:bg-primary text-white px-8 py-3.5 rounded-full font-bold transition-all hover:scale-105 shadow-md"
      >
        <Icon name="gamepad" />
        Buat Game Sendiri
      </Link>
    </div>
  );
}
