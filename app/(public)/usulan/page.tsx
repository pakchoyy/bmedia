import type { Metadata } from "next";
import UsulanForm from "@/components/UsulanForm";
import WaGroupButton from "@/components/WaGroupButton";

export const metadata: Metadata = {
  title: "Kirim Usulan",
  description: "Usulkan game baru, laporkan kendala, atau beri saran untuk Main-yuk.",
};

export default function UsulanPage() {
  return (
    <div className="fade-in pb-12">
      <div className="bg-nb-cream dark:bg-[#1d1a3d] border-b-[3px] border-nb-ink dark:border-[var(--nb-ink)] py-10 text-center px-4">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-nb-ink dark:text-white">
          Kirim <span className="nb-mark">Usulan</span>
        </h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300 max-w-xl mx-auto">
          Mau game apa lagi? Ada yang error? Tulis di sini, langsung dibaca Pak Choy.
        </p>
      </div>
      <div className="container mx-auto max-w-[720px] px-4 py-8">
        <UsulanForm />
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">Lebih suka ngobrol langsung?</p>
          <WaGroupButton />
        </div>
      </div>
    </div>
  );
}
