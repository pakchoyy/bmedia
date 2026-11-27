import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "@/lib/db";
import { requireGuru } from "@/lib/guru";
import LogoutButton from "@/components/guru/LogoutButton";

export const metadata: Metadata = { title: "Ruang Guru" };
export const dynamic = "force-dynamic";

interface Row {
  id: string;
  title: string;
  subject: string | null;
  grade: string | null;
  code: string;
  plays: number;
  n: number;
  hasil: number;
}

export default async function GuruDashboard() {
  const guru = await requireGuru();
  const sets = (await sql`
    SELECT id, title, subject, grade, code, plays, jsonb_array_length(questions)::int AS n,
      (SELECT count(*)::int FROM play_results r WHERE r.set_id = question_sets.id) AS hasil
    FROM question_sets WHERE teacher_id = ${guru.guruId}
    ORDER BY updated_at DESC
  `) as Row[];

  return (
    <div className="container mx-auto max-w-[1000px] px-4 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Ruang Guru</p>
          <h1 className="font-display text-3xl font-bold text-nb-ink dark:text-slate-100">Halo, {guru.name || "Guru"} 👋</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="nb rounded-2xl bg-nb-blue text-white p-5 mb-6">
        <h2 className="font-display font-bold text-xl">Cara pakai</h2>
        <ol className="text-sm mt-2 space-y-1 opacity-95 list-decimal list-inside">
          <li>Pilih game, lalu buat set soal (tulis, tempel, atau impor Word/PDF/CSV).</li>
          <li>Bagikan <b>kode kelas</b> atau QR ke murid.</li>
          <li>Murid buka <b>Mabar Yuk</b>, ketik kode, lalu bermain dengan soal Anda.</li>
        </ol>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-xl text-nb-ink dark:text-slate-100">Set Soal Saya</h2>
        <Link href="/guru/baru" className="nb-sm nb-press bg-nb-orange text-nb-ink font-bold px-4 py-2.5 rounded-lg text-sm">
          + Buat Set Soal
        </Link>
      </div>

      {sets.length === 0 ? (
        <div className="text-center border-[3px] border-dashed border-nb-ink/60 dark:border-[var(--nb-ink)] rounded-2xl p-10 text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          Belum ada set soal. Tekan <b>Buat Set Soal</b> untuk mulai.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sets.map((s) => (
            <Link key={s.id} href={`/guru/set/${s.id}`}
              className="block nb nb-hover bg-white dark:bg-slate-900 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-nb-ink dark:text-slate-100 truncate">{s.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[s.subject, s.grade].filter(Boolean).join(" · ") || "Tanpa mapel"} · {s.n} soal · dimainkan {s.plays}× · {s.hasil} hasil murid
                  </p>
                </div>
                <span className="shrink-0 font-mono font-extrabold tracking-widest text-nb-ink bg-nb-yellow nb-flat rounded-lg px-2 py-1 text-sm">
                  {s.code}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
