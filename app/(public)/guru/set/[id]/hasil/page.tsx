import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requireGuru } from "@/lib/guru";
import { getHasil, ringkas } from "@/lib/hasil-query";
import type { Soal } from "@/lib/soal";

export const metadata: Metadata = { title: "Hasil Murid" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fmtTgl = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const pct = (r: number, w: number) => (r + w ? `${Math.round((r / (r + w)) * 100)}%` : "–");

export default async function HasilPage({ params }: { params: { id: string } }) {
  const guru = await requireGuru();
  if (!UUID.test(params.id)) notFound();
  const sets = await sql`SELECT id, title, code, questions FROM question_sets WHERE id = ${params.id} AND teacher_id = ${guru.guruId} LIMIT 1`;
  const set = sets[0] as { id: string; title: string; code: string; questions: Soal[] } | undefined;
  if (!set) notFound();

  const rows = await getHasil(set.id);
  const r = ringkas(rows);

  return (
    <div className="container mx-auto max-w-[1000px] px-4 py-6">
      <Link href={`/guru/set/${set.id}`} className="text-sm text-gray-500 hover:text-nb-orange">&larr; Kembali ke set soal</Link>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-2 mb-5">
        <div>
          <p className="text-sm text-gray-500">Hasil murid · kode <span className="font-mono font-extrabold tracking-widest text-nb-ink dark:text-white">{set.code}</span></p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-nb-ink dark:text-white">{set.title}</h1>
        </div>
        {rows.length > 0 && (
          <a href={`/api/guru/set/${set.id}/hasil-csv`} className="nb-sm nb-press bg-nb-mint text-nb-ink font-extrabold rounded-xl px-4 py-2.5 text-sm">
            ⬇ Unduh Excel (CSV)
          </a>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="nb-sm rounded-2xl bg-white dark:bg-slate-900 p-8 text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="font-bold text-nb-ink dark:text-white">Belum ada murid yang menyelesaikan permainan.</p>
          <p className="text-sm text-gray-500 mt-1">Bagikan kode <b>{set.code}</b> atau QR. Hasil muncul di sini setelah murid selesai bermain.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Sesi bermain", String(r.total), "bg-nb-yellow"],
              ["Murid", String(r.murid.length), "bg-nb-mint"],
              ["Rata-rata skor", String(r.avgScore), "bg-nb-lilac"],
              ["Ketepatan kuis", r.accuracy === null ? "–" : `${r.accuracy}%`, "bg-nb-pink"],
            ].map(([l, v, bg]) => (
              <div key={l} className={`nb rounded-2xl p-4 text-nb-ink ${bg}`}>
                <div className="font-display font-bold text-3xl leading-none">{v}</div>
                <div className="text-sm font-bold mt-1">{l}</div>
              </div>
            ))}
          </div>

          {r.sulit.length > 0 && (
            <section className="nb-sm rounded-2xl bg-white dark:bg-slate-900 p-4">
              <h2 className="font-display font-bold text-xl text-nb-ink dark:text-white mb-1">Soal tersulit</h2>
              <p className="text-xs text-gray-500 mb-3">Soal yang paling sering dijawab salah. Cocok dibahas ulang di kelas.</p>
              <ul className="space-y-2">
                {r.sulit.slice(0, 3).map((s) => (
                  <li key={s.index} className="flex gap-3 items-start">
                    <span className="nb-flat shrink-0 rounded-full bg-nb-pink text-nb-ink px-2 py-0.5 text-xs font-extrabold">{Math.round(s.wrongRate * 100)}% salah</span>
                    <span className="text-sm text-nb-ink dark:text-slate-100"><b>No. {s.index + 1}.</b> {set.questions[s.index]?.q ?? "(soal sudah diubah)"}
                      <span className="text-gray-500"> · {s.right} benar, {s.wrong} salah</span></span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-display font-bold text-xl text-nb-ink dark:text-white mb-2">Peringkat murid</h2>
            <div className="nb-sm rounded-2xl bg-white dark:bg-slate-900 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b-2 border-nb-ink dark:border-[var(--nb-ink)] text-xs uppercase tracking-wide">
                  <th className="p-3">#</th><th className="p-3">Nama</th><th className="p-3 text-right">Skor terbaik</th><th className="p-3 text-right">Main</th><th className="p-3 text-right">Ketepatan</th><th className="p-3">Terakhir</th>
                </tr></thead>
                <tbody>
                  {r.murid.map((m, i) => (
                    <tr key={m.name} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                      <td className="p-3 font-extrabold">{i + 1}</td>
                      <td className="p-3 font-bold">{m.name}</td>
                      <td className="p-3 text-right font-extrabold">{m.best}</td>
                      <td className="p-3 text-right">{m.attempts}×</td>
                      <td className="p-3 text-right">{pct(m.right, m.wrong)}</td>
                      <td className="p-3 text-gray-500 whitespace-nowrap">{fmtTgl(m.last)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-nb-ink dark:text-white mb-2">Sesi terbaru</h2>
            <div className="nb-sm rounded-2xl bg-white dark:bg-slate-900 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b-2 border-nb-ink dark:border-[var(--nb-ink)] text-xs uppercase tracking-wide">
                  <th className="p-3">Waktu</th><th className="p-3">Nama</th><th className="p-3">Mode</th><th className="p-3 text-right">Skor</th><th className="p-3 text-right">Kupu</th><th className="p-3 text-right">Kuis</th>
                </tr></thead>
                <tbody>
                  {rows.slice(0, 50).map((x) => (
                    <tr key={x.id} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                      <td className="p-3 text-gray-500 whitespace-nowrap">{fmtTgl(x.created_at)}</td>
                      <td className="p-3 font-bold">{x.player_name}</td>
                      <td className="p-3">{x.mode === "edu" ? "Edukasi" : "Bebas"}</td>
                      <td className="p-3 text-right font-extrabold">{x.score}</td>
                      <td className="p-3 text-right">{x.caught}</td>
                      <td className="p-3 text-right">{x.mode === "edu" ? `${x.quiz_right}/${x.quiz_right + x.quiz_wrong}` : "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 50 && <p className="text-xs text-gray-500 mt-2">Menampilkan 50 sesi terbaru. Unduh CSV untuk data lengkap.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
