import type { Metadata } from "next";
import SubmitForm from "@/components/SubmitForm";
import WaGroupButton from "@/components/WaGroupButton";

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

        <div className="max-w-[800px] mx-auto mt-6 text-center space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Karya tetap milik pembuatnya. Main-yuk hanya menautkan dan memamerkannya, dan berhak menolak atau menghapus karya yang tidak sesuai.
            Karya terbaik bisa dipilih sebagai <b>Pilihan Main-yuk</b> di beranda, dengan nama pembuat tetap dicantumkan.
          </p>
          <WaGroupButton />
        </div>
      </div>
    </div>
  );
}
