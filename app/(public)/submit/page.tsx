import type { Metadata } from "next";
import SubmitForm from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Kirim Karya",
  description:
    "Bagikan media pembelajaran interaktif karya Anda kepada seluruh guru dan siswa di Indonesia.",
};

export default function SubmitPage() {
  return (
    <div className="fade-in py-10">
      <div className="container mx-auto max-w-[1200px] px-6">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-center text-nb-ink dark:text-white">
          Kirim <span className="nb-mark">Karya</span> Pembelajaran
        </h2>
        <p className="text-center mt-2 mb-8 max-w-[600px] mx-auto text-slate-700 dark:text-slate-300">
          Bagikan media pembelajaran buatanmu agar bisa digunakan guru lainnya.
        </p>

        <SubmitForm />
      </div>
    </div>
  );
}
