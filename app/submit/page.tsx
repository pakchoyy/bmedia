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
        <h2 className="section-title">Kirim Karya Media Pembelajaran</h2>
        <p className="text-center mb-8 max-w-[600px] mx-auto text-gray-600">
          Bagikan karya inovatif Anda kepada seluruh guru dan siswa di Indonesia.
          Mohon isi form berikut dengan data yang valid.
        </p>

        <SubmitForm />
      </div>
    </div>
  );
}
