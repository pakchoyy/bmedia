import Link from "next/link";
import Icon from "./Icon";

export default function CTAKirimKarya() {
  return (
    <div className="nb h-full rounded-2xl bg-nb-yellow text-nb-ink p-6 sm:p-8 flex flex-col items-start relative overflow-hidden">
      <div aria-hidden="true" className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/40" />
      <span className="nb-sm rounded-xl bg-white w-12 h-12 flex items-center justify-center mb-4">
        <Icon name="cloud-arrow-up" className="text-2xl" />
      </span>
      <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2">Punya media pembelajaran?</h2>
      <p className="mb-5 max-w-[440px] text-nb-ink/80">
        Bagikan karyamu dan bantu guru lain. Media ditinjau dulu sebelum dipublikasikan.
      </p>
      <Link href="/submit" className="nb nb-hover nb-press mt-auto bg-nb-orange text-nb-ink font-extrabold rounded-xl px-5 py-3 inline-flex items-center gap-2">
        <Icon name="plus" /> Kirim Karya
      </Link>
    </div>
  );
}
