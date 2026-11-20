import Link from "next/link";
import Icon from "./Icon";

export default function CTABuatGame() {
  return (
    <div className="nb h-full rounded-2xl bg-nb-blue text-white p-6 sm:p-8 flex flex-col items-start relative overflow-hidden">
      <div aria-hidden="true" className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/15" />
      <span className="nb-sm rounded-xl bg-white text-nb-ink w-12 h-12 flex items-center justify-center mb-4">
        <Icon name="gamepad" className="text-2xl" />
      </span>
      <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2">Punya ide media sendiri?</h2>
      <p className="text-white/90 mb-5 max-w-[440px]">
        Buat game edukasi tanpa coding. Pakai AI untuk menyusun media interaktif dalam hitungan menit.
      </p>
      <Link href="/buat" className="nb nb-hover nb-press mt-auto bg-nb-yellow text-nb-ink font-extrabold rounded-xl px-5 py-3 inline-flex items-center gap-2">
        <Icon name="gamepad" /> Buat Game Sendiri
      </Link>
    </div>
  );
}
