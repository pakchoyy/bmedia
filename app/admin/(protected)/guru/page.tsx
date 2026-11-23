import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Row { id: string; name: string; email: string; created_at: string; sets: number; soal: number; main: number; terakhir: string | null }

const tgl = (v: string | null) => v ? new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }) : "–";

export default async function AdminGuruPage() {
  const rows = (await sql`
    SELECT t.id, t.name, t.email, t.created_at,
      count(DISTINCT q.id)::int AS sets,
      coalesce(sum(jsonb_array_length(q.questions)) FILTER (WHERE jsonb_typeof(q.questions) = 'array'), 0)::int AS soal,
      (SELECT count(*)::int FROM play_results p JOIN question_sets q2 ON q2.id = p.set_id WHERE q2.teacher_id = t.id) AS main,
      greatest(max(q.updated_at), (SELECT max(p.created_at) FROM play_results p JOIN question_sets q3 ON q3.id = p.set_id WHERE q3.teacher_id = t.id)) AS terakhir
    FROM teachers t LEFT JOIN question_sets q ON q.teacher_id = t.id
    GROUP BY t.id ORDER BY t.created_at DESC
  `) as Row[];
  const aktif = rows.filter((r) => r.sets > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guru Terdaftar</h1>
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{rows.length} guru · {aktif} sudah membuat set soal</p>
      </div>
      {rows.length === 0 ? <p className="text-sm text-gray-500">Belum ada guru yang mendaftar.</p> : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left">
              <th className="px-4 py-3">Nama</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Daftar</th>
              <th className="px-4 py-3 text-right">Set soal</th><th className="px-4 py-3 text-right">Jml soal</th><th className="px-4 py-3 text-right">Dimainkan</th><th className="px-4 py-3">Aktif terakhir</th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="text-gray-800 dark:text-slate-200">
                  <td className="px-4 py-2.5 font-semibold">{r.name}</td>
                  <td className="px-4 py-2.5"><a href={`mailto:${r.email}`} className="text-blue-700 dark:text-blue-400 underline">{r.email}</a></td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{tgl(r.created_at)}</td>
                  <td className="px-4 py-2.5 text-right">{r.sets}</td>
                  <td className="px-4 py-2.5 text-right">{r.soal}</td>
                  <td className="px-4 py-2.5 text-right">{r.main}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{tgl(r.terakhir)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
