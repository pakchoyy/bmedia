import Link from "next/link";
import Icon from "./Icon";

export default function CTABuatGame() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-primary-light/5 dark:from-primary/10 dark:to-primary-light/10">
      <div className="container mx-auto max-w-[900px] text-center">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-10 max-md:p-6 border border-gray-100 dark:border-slate-800">
          <Icon name="gamepad" className="text-5xl text-primary-light mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-ink dark:text-slate-100 mb-3">
            Punya ide media sendiri?
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-300 mb-6 max-w-[600px] mx-auto">
            Buat game edukasi tanpa harus coding. Gunakan AI untuk menghasilkan media pembelajaran interaktif dalam hitungan menit.
          </p>
          <Link
            href="/buat"
            className="inline-flex items-center gap-2 bg-primary-light hover:bg-primary text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-md"
          >
            <Icon name="gamepad" />
            Buat Game Sendiri
          </Link>
        </div>
      </div>
    </section>
  );
}
