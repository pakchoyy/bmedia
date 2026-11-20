import type { Metadata } from "next";
import Link from "next/link";
import RuangJoinForm from "@/components/RuangJoinForm";
import { getRoomByCode, isRoomCode, normalizeRoomCode } from "@/lib/ruang";

export const metadata: Metadata = { title: "Gabung Mabar" };
export const dynamic = "force-dynamic";

export default async function RuangJoinPage({ params }: { params: { code: string } }) {
  const code = normalizeRoomCode(params.code);
  const room = isRoomCode(code) ? await getRoomByCode(code) : null;
  const ok = room && room.status === "lobby";
  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-10">
      <div className="w-full max-w-sm mx-auto nb bg-white dark:bg-slate-900 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-2">🌐</div>
        <h1 className="font-display text-2xl font-bold text-nb-ink dark:text-white">Gabung Mabar</h1>
        {ok ? (
          <>
            <p className="text-sm text-gray-500 mt-1 mb-4">Ruang <b className="font-mono tracking-widest text-nb-ink dark:text-white">{code}</b> menunggumu. Tulis namamu lalu tunggu guru memulai.</p>
            <RuangJoinForm code={code} />
          </>
        ) : (
          <p className="text-sm mt-3 text-slate-700 dark:text-slate-300" role="alert">
            {room ? "Permainan di ruang ini sudah dimulai atau selesai. Minta guru membuat ruang baru." : "Ruang tidak ditemukan atau sudah ditutup. Periksa kodenya lagi."}
          </p>
        )}
        <Link href="/main" className="block mt-5 text-sm font-bold underline text-nb-ink dark:text-white">&larr; Masukkan kode lain</Link>
      </div>
    </div>
  );
}
